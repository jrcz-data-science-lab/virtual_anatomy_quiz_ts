import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import {
  Quiz,
  Submission,
  OrganGroup,
  MeshCatalogItem,
} from "@/app/models/Quiz";
import type {
  IQuiz,
  IQuestion,
  ISubmissionAnswer,
  IMeshCatalogItem,
} from "@/app/models/Quiz";
import mongoose, { Types } from "mongoose";

interface AnswerBreakdown {
  answerText: string; // For MCQ/TF: option text. For Select-Organ: mesh/group display name.
  studentCount: number;
  isCorrectOption?: boolean;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: IQuestion["type"];
  totalSubmissionsForQuestion: number;
  totalCorrect: number;
  answersBreakdown: AnswerBreakdown[];
  submittedTextAnswers?: string[]; // For short-answer responses
  correctTargetDisplayName?: string; // For select-organ: display name of the correct mesh or group
}

type LeanOrgan = {
  _id: Types.ObjectId;
  displayName: string;
  meshName: string;
  region?: string;
};
type LeanMeshCatalogItem = Omit<IMeshCatalogItem, keyof Document> & {
  _id: Types.ObjectId;
};
type LeanOrganGroup = { _id: Types.ObjectId; groupName: string };

/**
 * Handles GET requests to retrieve results for a quiz.
 *
 * Connects to the database and fetches the quiz document and its submissions.
 * For each question, it determines the breakdown of answers and correctness
 * based on the submissions. For `select-organ` questions, it fetches the
 * details of the clicked mesh and the target mesh/group. Returns the results
 * in the form of a `QuestionResult` array.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {RequestContext} context - Contains the parameters including the quiz ID.
 * @returns {Promise<NextResponse>} The response containing the quiz results or an error message.
 * @example
 * GET /api/quizzes/123/results
 */
export async function GET(
  req: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const quizId = context.params.id;

    if (!quizId || !Types.ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { error: "Invalid Quiz ID format" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.findById(quizId).lean<IQuiz>();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const submissions = await Submission.find({
      quiz_id: new Types.ObjectId(quizId),
    }).lean<
      {
        _id: Types.ObjectId;
        quiz_id: Types.ObjectId;
        student_id?: string;
        studyYearAtSubmission: number;
        submittedAt: Date;
        answers: ISubmissionAnswer[];
      }[]
    >();

    const questionResults: QuestionResult[] = [];

    // Pre-fetch mesh and group details for "select-organ" questions and answers
    const itemIdsToFetch = new Set<string>(); // For MeshCatalogItem._id
    const groupIdsToFetch = new Set<string>(); // For OrganGroup._id

    quiz.questions.forEach((q: IQuestion) => {
      if (q.type === "select-organ" && q.target_id) {
        if (
          q.targetType === "mesh" &&
          Types.ObjectId.isValid(q.target_id.toString())
        )
          itemIdsToFetch.add(q.target_id.toString());
        if (
          q.targetType === "group" &&
          Types.ObjectId.isValid(q.target_id.toString())
        )
          groupIdsToFetch.add(q.target_id.toString());
      }
    });
    submissions.forEach((sub) => {
      sub.answers.forEach((ans) => {
        if (
          ans.responseText_ClickedMesh_id &&
          Types.ObjectId.isValid(ans.responseText_ClickedMesh_id.toString())
        ) {
          itemIdsToFetch.add(ans.responseText_ClickedMesh_id.toString());
        }
      });
    });

    const meshCatalogDetailsArray = await MeshCatalogItem.find({
      _id: {
        $in: Array.from(itemIdsToFetch).map((id) => new Types.ObjectId(id)),
      },
    }).lean<LeanMeshCatalogItem[]>();
    const organGroupDetailsArray = await OrganGroup.find({
      _id: {
        $in: Array.from(groupIdsToFetch).map((id) => new Types.ObjectId(id)),
      },
    }).lean<LeanOrganGroup[]>();

    const meshCatalogMap = new Map(
      meshCatalogDetailsArray.map((item) => [item._id.toString(), item])
    );
    const organGroupMap = new Map(
      organGroupDetailsArray.map((group) => [group._id.toString(), group])
    );

    for (const question of quiz.questions) {
      const currentQuestionIdString = question._id?.toString();
      if (!currentQuestionIdString) continue;

      const questionSubmissions = submissions
        .map((sub) =>
          sub.answers.find(
            (ans) => ans.question_id.toString() === currentQuestionIdString
          )
        )
        .filter((ans): ans is ISubmissionAnswer => ans !== undefined);

      let totalCorrect = 0;
      let currentAnswersBreakdown: AnswerBreakdown[] = [];
      let currentSubmittedTextAnswers: string[] | undefined = undefined;
      let currentCorrectTargetDisplayName: string | undefined = undefined;

      // Determine correct target display name for select-organ questions
      if (question.type === "select-organ" && question.target_id) {
        if (question.targetType === "mesh") {
          currentCorrectTargetDisplayName =
            meshCatalogMap.get(question.target_id.toString())?.displayName ||
            "Unknown Target Mesh";
        } else if (question.targetType === "group") {
          currentCorrectTargetDisplayName =
            organGroupMap.get(question.target_id.toString())?.groupName ||
            "Unknown Target Group";
        }
      }

      if (
        question.type === "multiple-choice" ||
        question.type === "true-false"
      ) {
        const optionCounts = new Array(question.answers?.length || 0).fill(0);
        questionSubmissions.forEach((submittedAnswer) => {
          if (
            submittedAnswer.selectedAnswerId_Index !== undefined &&
            question.answers &&
            submittedAnswer.selectedAnswerId_Index >= 0 &&
            submittedAnswer.selectedAnswerId_Index < question.answers.length
          ) {
            optionCounts[submittedAnswer.selectedAnswerId_Index]++;
            if (
              question.answers[submittedAnswer.selectedAnswerId_Index]
                ?.isCorrect
            )
              totalCorrect++;
          }
        });
        question.answers?.forEach((opt, index) => {
          currentAnswersBreakdown.push({
            answerText: opt.text.toString(),
            studentCount: optionCounts[index],
            isCorrectOption: Boolean(opt.isCorrect),
          });
        });
      } else if (question.type === "select-organ") {
        const answerTargetCounts: Record<string, number> = {}; // Key: Clicked MeshCatalogItem ID

        questionSubmissions.forEach((submittedAnswer) => {
          const clickedMeshId =
            submittedAnswer.responseText_ClickedMesh_id?.toString();
          if (clickedMeshId) {
            answerTargetCounts[clickedMeshId] =
              (answerTargetCounts[clickedMeshId] || 0) + 1;

            // Determine correctness
            let isCorrect = false;
            if (question.targetType === "mesh") {
              isCorrect = clickedMeshId === question.target_id?.toString();
            } else if (question.targetType === "group") {
              const clickedMeshDetail = meshCatalogMap.get(clickedMeshId);
              if (clickedMeshDetail?.organGroupIds) {
                isCorrect = clickedMeshDetail.organGroupIds.some(
                  (groupId) =>
                    groupId.toString() === question.target_id?.toString()
                );
              }
            }
            if (isCorrect) totalCorrect++;
          } else {
            answerTargetCounts["No Answer"] =
              (answerTargetCounts["No Answer"] || 0) + 1;
          }
        });

        // Create breakdown based on what was clicked or the target
        const allClickedOrTargetMeshIds = new Set<string>(
          Object.keys(answerTargetCounts).filter((k) => k !== "No Answer")
        );
        if (question.targetType === "mesh" && question.target_id)
          allClickedOrTargetMeshIds.add(question.target_id.toString());
        // For group targets, the target_id is a group. Breakdown items will be clicked meshes.

        allClickedOrTargetMeshIds.forEach((meshIdStr) => {
          const meshDetail = meshCatalogMap.get(meshIdStr);
          let isOptionCorrect = false;
          if (question.targetType === "mesh") {
            isOptionCorrect = meshIdStr === question.target_id?.toString();
          } else if (question.targetType === "group") {
            if (meshDetail?.organGroupIds) {
              isOptionCorrect = meshDetail.organGroupIds.some(
                (gId) => gId.toString() === question.target_id?.toString()
              );
            }
          }
          currentAnswersBreakdown.push({
            answerText:
              meshDetail?.displayName ||
              `Unknown Mesh (${meshIdStr.substring(0, 6)}...)`,
            studentCount: answerTargetCounts[meshIdStr] || 0,
            isCorrectOption: isOptionCorrect,
          });
        });
        if (answerTargetCounts["No Answer"]) {
          currentAnswersBreakdown.push({
            answerText: "No Answer",
            studentCount: answerTargetCounts["No Answer"],
            isCorrectOption: false,
          });
        }
      } else if (question.type === "short-answer") {
        currentSubmittedTextAnswers = [];
        questionSubmissions.forEach((submittedAnswer) => {
          currentSubmittedTextAnswers!.push(
            submittedAnswer.responseText_ShortAnswer || "No Answer"
          );
        });
        totalCorrect = 0;
      }

      questionResults.push({
        questionId: currentQuestionIdString,
        questionText: question.questionText,
        questionType: question.type,
        totalSubmissionsForQuestion: questionSubmissions.length,
        totalCorrect: totalCorrect,
        answersBreakdown: currentAnswersBreakdown,
        submittedTextAnswers: currentSubmittedTextAnswers,
        correctTargetDisplayName: currentCorrectTargetDisplayName,
      });
    }

    return NextResponse.json(questionResults, { status: 200 });
  } catch (error) {
    console.error("Failed to get quiz results:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to get quiz results", details: errorMessage },
      { status: 500 }
    );
  }
}
