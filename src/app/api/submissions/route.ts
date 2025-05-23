import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Submission } from "@/app/models/Quiz";
import type { ISubmissionAnswer } from "@/app/models/Quiz";

/**
 * Handles POST requests to create a new quiz submission.
 *
 * It expects a JSON body with:
 * - quizId: string (ID of the quiz)
 * - studentId?: string (Optional ID of the student)
 * - submittedAt: string (ISO date string of when the quiz was submitted)
 * - answers: Array of ISubmissionAnswer objects, where each object contains:
 * - questionId: string (ID of the question)
 * - selectedAnswerId?: number (Index of the selected answer for multiple-choice/true-false)
 * - textResponse?: string (Text of the answer for short-answer or ID of selected organ for select-organ)
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves to the HTTP response.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();

    const { quizId, studentId, submittedAt, answers } = body;

    // Validate required fields
    if (!quizId || !submittedAt || !Array.isArray(answers)) {
      return NextResponse.json(
        {
          error:
            "Invalid submission format. Missing quizId, submittedAt, or answers.",
        },
        { status: 400 }
      );
    }

    // Validate structure of each answer
    if (
      answers.some(
        (ans: any) =>
          !ans.questionId ||
          (ans.selectedAnswerId === undefined && ans.textResponse === undefined)
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid answer format. Each answer must have a questionId and either selectedAnswerId or textResponse.",
        },
        { status: 400 }
      );
    }

    const submissionData = {
      quizId,
      studentId, // studentId is optional
      submittedAt: new Date(submittedAt),
      answers: answers as ISubmissionAnswer[], // Directly embed the answers array
    };

    const newSubmission = await Submission.create(submissionData);

    return NextResponse.json(
      { success: true, submissionId: newSubmission._id, data: newSubmission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission failed:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Failed to submit quiz due to validation errors.",
          details: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit quiz." },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to retrieve all submissions or submissions filtered by quizId or studentId.
 * Example query: `/api/submissions?quizId=someId`
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves to the HTTP response.
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const studentId = searchParams.get("studentId");

    const filter: any = {};
    if (quizId) filter.quizId = quizId;
    if (studentId) filter.studentId = studentId;

    const submissions = await Submission.find(filter).populate("quizId");

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
