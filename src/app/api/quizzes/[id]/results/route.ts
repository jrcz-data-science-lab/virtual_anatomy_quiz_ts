import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Quiz, Submission, Organ } from "@/app/models/Quiz";
import type { IQuiz, IQuestion, ISubmissionAnswer } from "@/app/models/Quiz";
import Mongoose, { Types } from "mongoose";

interface AnswerBreakdown {
  answerText: string;
  studentCount: number;
  isCorrectOption?: boolean; // True if this specific option is the correct one
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: IQuestion["type"];
  totalSubmissionsForQuestion: number;
  totalCorrect: number; // Will be 0 if questionType is "short-answer"
  answersBreakdown: AnswerBreakdown[]; // Used for chartable types (MCQ, T/F, Select Organ)
  submittedTextAnswers?: string[]; // Specifically used for short-answer responses
  // For select-organ, we want to store the correct organ's display name
  correctOrganDisplayName?: string;
}

// Define a type for lean Organ objects
type LeanOrgan = {
  _id: Types.ObjectId; // Correctly typed ObjectId
  displayName: string;
  meshName: string; // Assuming from IOrgan
  region?: string; // Assuming from IOrgan, optional
};

/**
 * Handles GET requests to retrieve question-level results for a given quiz.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {{ params: Promise<{ id: string }> }} props - The props object containing the quiz id.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * an array of question results, each containing the question text, type, total submissions,
 * total correct, and an array of answer breakdowns (for chartable types), or a status code
 * of 400 if the quiz ID is missing, 404 if the quiz is not found, or 500 on failure.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const quizId = params.id; // Use the actual param name

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.findById(quizId).lean<IQuiz>();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const submissions = await Submission.find({ quizId: quiz._id }).lean<
      {
        studentId?: string;
        quizId: string;
        submittedAt: Date;
        answers: ISubmissionAnswer[];
        _id: Types.ObjectId;
      }[]
    >();
    const questionResults: QuestionResult[] = [];

    const organIdsToFetch = new Set<string>();
    quiz.questions.forEach((q: IQuestion) => {
      if (q.type === "select-organ" && q.expectedOrganId) {
        if (Types.ObjectId.isValid(q.expectedOrganId))
          organIdsToFetch.add(q.expectedOrganId);
      }
    });
    submissions.forEach((sub) => {
      sub.answers.forEach((ans: ISubmissionAnswer) => {
        const question = quiz.questions.find(
          (q: IQuestion) => q._id?.toString() === ans.questionId
        );
        if (question?.type === "select-organ" && ans.textResponse) {
          if (Types.ObjectId.isValid(ans.textResponse))
            organIdsToFetch.add(ans.textResponse);
        }
      });
    });

    const validOrganObjectIds = Array.from(organIdsToFetch).map(
      (id) => new Types.ObjectId(id)
    );
    const organDetails = await Organ.find({
      _id: { $in: validOrganObjectIds },
    }).lean<LeanOrgan[]>();
    const organMap = new Map(
      organDetails.map((org) => [org._id.toString(), org.displayName])
    );

    for (const question of quiz.questions) {
      const currentQuestionIdString = question._id?.toString();
      if (!currentQuestionIdString) {
        console.warn(
          "Skipping question due to missing _id:",
          question.question
        );
        continue;
      }

      const questionSubmissions = submissions
        .map((sub) =>
          sub.answers.find(
            (ans: ISubmissionAnswer) =>
              ans.questionId === currentQuestionIdString
          )
        )
        .filter((ans): ans is ISubmissionAnswer => ans !== undefined);

      // Initialize variables for the current question's result
      let totalCorrect = 0;
      let currentAnswersBreakdown: AnswerBreakdown[] = [];
      let currentSubmittedTextAnswers: string[] | undefined = undefined;
      let currentCorrectOrganDisplayName: string | undefined = undefined;

      if (question.type === "select-organ" && question.expectedOrganId) {
        currentCorrectOrganDisplayName =
          organMap.get(question.expectedOrganId) || "Unknown Correct Organ";
      }

      if (
        question.type === "multiple-choice" ||
        question.type === "true-false"
      ) {
        const optionCounts = new Array(question.answers?.length || 0).fill(0);

        questionSubmissions.forEach((submittedAnswer) => {
          if (
            submittedAnswer.selectedAnswerId !== undefined &&
            question.answers && // Ensure question.answers exists
            submittedAnswer.selectedAnswerId >= 0 &&
            submittedAnswer.selectedAnswerId < question.answers.length // Check bounds
          ) {
            // Increment count for the CHOSEN OPTION INDEX
            optionCounts[submittedAnswer.selectedAnswerId]++;

            // Check if the chosen option index corresponds to a correct answer
            if (question.answers[submittedAnswer.selectedAnswerId]?.isCorrect) {
              totalCorrect++;
            }
          }
        });

        // Construct answersBreakdown by iterating through the original question options
        // and using the counts from optionCounts (which are per-index)
        question.answers?.forEach((opt, index) => {
          currentAnswersBreakdown.push({
            answerText: opt.text.toString(), // The display text of the option
            studentCount: optionCounts[index], // The count for this specific option (by its index)
            isCorrectOption: Boolean(opt.isCorrect),
          });
        });
      } else if (question.type === "select-organ") {
        const tempCounts: Record<string, number> = {};
        questionSubmissions.forEach((submittedAnswer) => {
          if (submittedAnswer.textResponse) {
            const organId = submittedAnswer.textResponse;
            tempCounts[organId] = (tempCounts[organId] || 0) + 1;
            if (organId === question.expectedOrganId) totalCorrect++;
          } else {
            const noAnswerKey = "No Answer";
            tempCounts[noAnswerKey] = (tempCounts[noAnswerKey] || 0) + 1;
          }
        });

        const allRelevantOrganIds = new Set<string>();
        if (
          question.expectedOrganId &&
          Types.ObjectId.isValid(question.expectedOrganId)
        )
          allRelevantOrganIds.add(question.expectedOrganId);
        questionSubmissions.forEach((sa) => {
          if (sa.textResponse && Types.ObjectId.isValid(sa.textResponse))
            allRelevantOrganIds.add(sa.textResponse);
        });

        allRelevantOrganIds.forEach((organId) => {
          currentAnswersBreakdown.push({
            answerText:
              organMap.get(organId) ||
              `Unknown Organ (${organId.substring(0, 6)}...)`,
            studentCount: tempCounts[organId] || 0,
            isCorrectOption: organId === question.expectedOrganId,
          });
        });
        if (tempCounts["No Answer"]) {
          currentAnswersBreakdown.push({
            answerText: "No Answer",
            studentCount: tempCounts["No Answer"],
            isCorrectOption: false,
          });
        }
      } else if (question.type === "short-answer") {
        currentSubmittedTextAnswers = []; // Initialize for this type
        questionSubmissions.forEach((submittedAnswer) => {
          currentSubmittedTextAnswers!.push(
            submittedAnswer.textResponse || "No Answer"
          );
        });
        // answersBreakdown remains empty for short-answer as it's not charted traditionally
        totalCorrect = 0; // No automated way to determine correctness for short-answer yet
      }

      // Single push operation for each question
      questionResults.push({
        questionId: currentQuestionIdString,
        questionText: question.question,
        questionType: question.type,
        totalSubmissionsForQuestion: questionSubmissions.length,
        totalCorrect: totalCorrect,
        answersBreakdown: currentAnswersBreakdown, // Populated for chartable types, empty for short-answer
        submittedTextAnswers: currentSubmittedTextAnswers, // Populated for short-answer, undefined otherwise
        correctOrganDisplayName: currentCorrectOrganDisplayName,
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
