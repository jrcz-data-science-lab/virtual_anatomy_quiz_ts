import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Quiz } from "@/app/models/Quiz";
import mongoose, { Types } from "mongoose";

interface RequestContext {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a quiz by its ID.
 *
 * Connects to the database and fetches a quiz document based on the provided
 * ID from the request context. If the ID is missing or invalid, it returns
 * a 400 status with an error message. If the quiz is not found, it returns
 * a 404 status. On success, it returns the quiz data with a 200 status.
 * Logs and returns a 500 status with an error message if an exception occurs.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {RequestContext} context - Contains the parameters including the quiz ID.
 * @returns {Promise<NextResponse>} The response containing the quiz data or an error message.
 */
export async function GET(
  req: Request,
  context: RequestContext
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

    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error("Failed to get quiz:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to get quiz", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an existing quiz in the database.
 *
 * The function expects a JSON body with the following structure:
 * - title: string (required) - The title of the quiz.
 * - description: string (optional) - A brief description of the quiz.
 * - studyYear: number (required) - The academic year for which the quiz is intended.
 * - questions: Array (required) - A list of questions, each containing:
 *   - questionText: string (required) - The text of the question.
 *   - type: string (required) - The type of the question (e.g., multiple-choice, true-false, select-organ).
 *   - answers: Array (optional) - A list of answer objects, each with:
 *     - text: string (required for each answer) - The answer text.
 *     - isCorrect: boolean (required for each answer) - Whether the answer is correct.
 *   - targetType: string (required for select-organ) - The target type ('mesh' or 'group') for select-organ questions.
 *   - target_id: ObjectId (required for select-organ) - The target identifier for select-organ questions.
 * - scheduledAt: string (optional) - An ISO date string indicating when the quiz is scheduled.
 *
 * The function validates the input data, ensuring required fields are present and have correct types.
 * If validation fails, it returns a 400 status with an error message. If the quiz is not found, it returns
 * a 404 status. On success, it returns the updated quiz data with a 200 status. Logs and returns a 500 status
 * with an error message if an exception occurs.
 *
 * @param {Request} req - The incoming HTTP request.
 * @param {RequestContext} context - Contains the parameters including the quiz ID.
 * @returns {Promise<NextResponse>} The response containing the updated quiz data or an error message.
 */
export async function PUT(
  req: Request,
  context: RequestContext
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

    const body = await req.json();

    // Validate required quiz-level fields
    if (!body.title || body.studyYear === undefined) {
      // studyYear can be 0, so check for undefined
      return NextResponse.json(
        { error: "Missing required fields: title or studyYear." },
        { status: 400 }
      );
    }
    if (typeof body.studyYear !== "number") {
      return NextResponse.json(
        { error: "studyYear must be a number." },
        { status: 400 }
      );
    }

    // Validate each question if questions are part of the update payload
    if (Array.isArray(body?.questions)) {
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
          // Ensure target_id is ObjectId for saving
          q.target_id = new Types.ObjectId(q.target_id);
        }
        // Ensure answers sub-documents also have ObjectIds if they are new and don't have one
        if (q.answers && Array.isArray(q.answers)) {
          q.answers = q.answers.map((ans: any) => ({
            ...ans,
            _id: ans._id ? new Types.ObjectId(ans._id) : new Types.ObjectId(),
          }));
        }
        // Ensure questions have ObjectIds
        q._id = q._id ? new Types.ObjectId(q._id) : new Types.ObjectId();
      }
    }

    const updateData = {
      title: body.title,
      description: body.description,
      studyYear: body.studyYear,
      questions: body.questions, // Assuming frontend sends complete, structured questions
      scheduledAt: body.scheduledAt
        ? new Date(body.scheduledAt)
        : body.scheduledAt === null
        ? null
        : undefined,
    };

    // Filter out undefined values to prevent overwriting fields with undefined
    Object.keys(updateData).forEach(
      (key) =>
        updateData[key as keyof typeof updateData] === undefined &&
        delete updateData[key as keyof typeof updateData]
    );

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updateData, {
      new: true,
      runValidators: true,
    }).lean(); //

    if (!updatedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(updatedQuiz, { status: 200 });
  } catch (error) {
    console.error("Failed to update quiz:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update quiz", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RequestContext) {
  try {
    await dbConnect();
    const quizId = context.params.id;

    if (!quizId || !Types.ObjectId.isValid(quizId)) {
      return NextResponse.json(
        { error: "Invalid Quiz ID format" },
        { status: 400 }
      );
    }

    const deletedQuiz = await Quiz.findByIdAndDelete(quizId).lean();

    if (!deletedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Quiz deleted successfully", deletedQuiz },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete quiz", details: errorMessage },
      { status: 500 }
    );
  }
}
