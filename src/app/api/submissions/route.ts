import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Submission, Quiz, MeshCatalogItem } from "@/app/models/Quiz";
import mongoose, { Types } from "mongoose";
import type { ISubmissionAnswer } from "@/app/models/Quiz";

/**
 * Handles POST requests to create a new submission in the database.
 *
 * The function expects a JSON body with the following structure:
 * - quiz_id: ObjectId (required) - The ID of the quiz being submitted.
 * - studyYearAtSubmission: number (required) - The student's study year.
 * - submittedAt: string (required) - The ISO date string of the submission.
 * - answers: Array (required) - A list of answer objects, each containing:
 *   - question_id: ObjectId (required) - The ID of the question.
 *   - selectedAnswerId_Index: number (optional) - The index of the selected answer.
 *   - responseText_ClickedMesh_id: ObjectId (optional) - The ID of the selected mesh.
 *   - responseText_ShortAnswer: string (optional) - The student's short answer.
 *
 * The function validates the input data, ensuring required fields are present and have correct types.
 * If validation fails, it returns a 400 status with an error message. If the quiz is not found, it returns
 * a 404 status. On success, it returns the created submission data with a 201 status. Logs and returns a 500 status
 * with an error message if an exception occurs.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} The response containing the created submission data or an error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();

    const { quiz_id, studyYearAtSubmission, submittedAt, answers } = body;

    // Validate required fields
    if (!quiz_id || !Types.ObjectId.isValid(quiz_id)) {
      return NextResponse.json(
        { error: "Invalid or missing quiz_id." },
        { status: 400 }
      );
    }
    if (
      studyYearAtSubmission === undefined ||
      typeof studyYearAtSubmission !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid studyYearAtSubmission." },
        { status: 400 }
      );
    }
    if (!submittedAt) {
      return NextResponse.json(
        { error: "Missing submittedAt." },
        { status: 400 }
      );
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Answers array is missing or empty." },
        { status: 400 }
      );
    }

    // Validate each answer structure
    for (const ans of answers) {
      if (!ans.question_id || !Types.ObjectId.isValid(ans.question_id)) {
        return NextResponse.json(
          { error: `Invalid or missing question_id in one of the answers.` },
          { status: 400 }
        );
      }
      // Ensure at least one answer type field is present
      const hasAnswerField =
        ans.selectedAnswerId_Index !== undefined ||
        ans.responseText_ClickedMesh_id !== undefined ||
        ans.responseText_ShortAnswer !== undefined;
      if (!hasAnswerField) {
        return NextResponse.json(
          { error: `Missing answer data for question_id: ${ans.question_id}.` },
          { status: 400 }
        );
      }
      if (
        ans.responseText_ClickedMesh_id &&
        !Types.ObjectId.isValid(ans.responseText_ClickedMesh_id)
      ) {
        return NextResponse.json(
          {
            error: `Invalid responseText_ClickedMesh_id ObjectId format for question_id: ${ans.question_id}.`,
          },
          { status: 400 }
        );
      }
    }

    // Ensure the quiz exists
    const quizExists = await Quiz.findById(quiz_id).countDocuments();
    if (quizExists === 0) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    const submissionData = {
      quiz_id: new Types.ObjectId(quiz_id),
      studyYearAtSubmission: studyYearAtSubmission,
      submittedAt: new Date(submittedAt),
      answers: answers.map((ans: any) => ({
        question_id: new Types.ObjectId(ans.question_id),
        selectedAnswerId_Index: ans.selectedAnswerId_Index,
        responseText_ClickedMesh_id: ans.responseText_ClickedMesh_id
          ? new Types.ObjectId(ans.responseText_ClickedMesh_id)
          : undefined,
        responseText_ShortAnswer: ans.responseText_ShortAnswer,
      })),
    };

    const newSubmission = new Submission(submissionData);
    await newSubmission.save();

    return NextResponse.json(
      { success: true, submissionId: newSubmission._id, data: newSubmission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit quiz", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to retrieve submissions from the database.
 *
 * This function connects to the database and fetches submissions based on
 * the provided `quiz_id` query parameter. If `quiz_id` is valid, it filters
 * submissions by the specified quiz ID. The function populates the `quiz_id`
 * field with the quiz's title and study year, sorts the results by
 * submission date in descending order, and returns them as a JSON response
 * with a status of 200 on success. If an error occurs, it logs the error
 * and returns a 500 status with an error message.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves with the HTTP response.
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quiz_id");

    const filter: any = {};
    if (quizId && Types.ObjectId.isValid(quizId))
      filter.quiz_id = new Types.ObjectId(quizId);

    const submissions = await Submission.find(filter)
      .populate({ path: "quiz_id", select: "title studyYear" })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, data: submissions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to retrieve submissions:", error);
    return NextResponse.json(
      { error: "Failed to retrieve submissions." },
      { status: 500 }
    );
  }
}
