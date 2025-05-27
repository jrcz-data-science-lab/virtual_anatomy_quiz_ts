import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Quiz } from "@/app/models/Quiz";
import mongoose, { Types } from "mongoose";

/**
 * Handles GET requests to retrieve all quizzes from the database.
 *
 * The function first connects to the database using the {@link dbConnect} function.
 * Then, it performs a `find` query on the `Quiz` model with an optional filter
 * by `studyYear` if the `studyYear` query parameter is provided in the URL. The
 * function returns an array of quizzes, sorted in descending order by creation
 * date, and a status code of 200 on success. If the query fails, the function
 * logs an error and returns an error response with a status code of 500.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves with the HTTP response.
 * @example
 * GET /api/quizzes?studyYear=1
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const studyYearQuery = searchParams.get("studyYear");

    const filter: any = {};
    if (studyYearQuery) {
      const year = parseInt(studyYearQuery, 10);
      if (!isNaN(year)) {
        filter.studyYear = year;
      } else {
        return NextResponse.json(
          { error: "Invalid studyYear parameter. Must be a number." },
          { status: 400 }
        );
      }
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Failed to get quizzes:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to get quizzes", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new quiz in the database.
 *
 * The function expects a JSON body with the following structure:
 * - title: string (required) - The title of the quiz.
 * - description: string (optional) - A brief description of the quiz.
 * - studyYear: number (required) - The academic year for which the quiz is intended.
 * - questions: Array (required) - A list of questions, each containing:
 *   - questionText: string (required) - The text of the question.
 *   - type: string (required) - The type of the question (e.g., multiple-choice, true-false, select-organ, short-answer).
 *   - answers: Array (optional) - A list of answer objects, each with:
 *     - text: string (required for each answer) - The answer text.
 *     - isCorrect: boolean (required for each answer) - Whether the answer is correct.
 *   - targetType: string (required for select-organ) - The target type ('mesh' or 'group') for select-organ questions.
 *   - target_id: ObjectId (required for select-organ) - The target identifier for select-organ questions.
 * - scheduledAt: string (optional) - An ISO date string indicating when the quiz is scheduled.
 *
 * The function validates the input data, ensuring required fields are present and have correct types.
 * It creates a new quiz document in the database if validation succeeds, returning a JSON response
 * with the created quiz and a 201 status code. If validation fails or an error occurs, it returns
 * a JSON response with an appropriate error message and status code.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A promise that resolves to the HTTP response.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate required quiz-level fields
    if (
      !body.title ||
      !body.studyYear ||
      !body.questions ||
      !Array.isArray(body.questions)
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, studyYear, or questions array.",
        },
        { status: 400 }
      );
    }
    if (typeof body.studyYear !== "number") {
      return NextResponse.json(
        { error: "studyYear must be a number." },
        { status: 400 }
      );
    }

    // Validate each question
    for (const q of body.questions) {
      if (!q.questionText?.trim() || !q.type) {
        return NextResponse.json(
          { error: "Each question must have questionText and type." },
          { status: 400 }
        );
      }
      if (q.type === "select-organ") {
        if (!q.targetType || !q.target_id) {
          return NextResponse.json(
            {
              error:
                "Select-organ questions must have targetType and target_id.",
            },
            { status: 400 }
          );
        }
        if (!["mesh", "group"].includes(q.targetType)) {
          return NextResponse.json(
            {
              error:
                "Invalid targetType for select-organ question. Must be 'mesh' or 'group'.",
            },
            { status: 400 }
          );
        }
        if (!Types.ObjectId.isValid(q.target_id)) {
          return NextResponse.json(
            {
              error: `Invalid target_id ObjectId format for question: ${q.questionText}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const quizData = {
      title: body.title,
      description: body.description,
      studyYear: body.studyYear,
      questions: body.questions.map((q: any) => ({
        questionText: q.questionText,
        type: q.type,
        answers:
          q.answers?.map((ans: any) => ({
            text: ans.text,
            isCorrect: ans.isCorrect,
          })) || [],
        targetType: q.type === "select-organ" ? q.targetType : undefined,
        target_id:
          q.type === "select-organ" && q.target_id
            ? new Types.ObjectId(q.target_id)
            : undefined,
      })),
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    };

    const newQuiz = new Quiz(quizData);
    await newQuiz.save();

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create quiz", details: errorMessage },
      { status: 500 }
    );
  }
}
