import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Quiz } from "@/app/models/Quiz";
import mongoose, { Types } from "mongoose";
import { z } from "zod";

// --- Zod Schemas ---

// Schema for an answer (within a Question for MCQ/TF)
const answerSchema = z.object({
  text: z
    .string({ required_error: "Answer text is required" })
    .trim()
    .min(1, { message: "Answer text must be at least 1 character long" }),
  isCorrect: z.boolean({ required_error: "isCorrect flag is required" }),
});

const selectOrganAnswerSchema = z.object({
  text: z
    .string({ required_error: "Answer text is required" })
    .trim()
    .min(1, { message: "Answer text must be at least 1 character long" }),
  isCorrect: z.boolean({ required_error: "isCorrect flag is required" }),
  target_id: z
    .string({
      required_error: "target_id is required for select-organ questions.",
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid target_id format. Must be a valid ObjectId string.",
    }),
});

// Base Question Schema (common fields for request body from client)
const baseRequestBodyQuestionSchema = z.object({
  questionText: z
    .string({ required_error: "Question text is required" })
    .trim()
    .min(1, { message: "Question text must be at least 1 character long" }),
});

// Specific Question Type Schemas for request body

const multipleChoiceQuestionRequestBodySchema =
  baseRequestBodyQuestionSchema.extend({
    type: z.literal("multiple-choice"),
    answers: z
      .array(answerSchema)
      .min(1, { message: "At least one answer is required" }),
  });

const trueFalseQuestionRequestBodySchema = baseRequestBodyQuestionSchema.extend(
  {
    type: z.literal("true-false"),
    answers: z
      .array(answerSchema)
      .min(1, { message: "At least one answer is required" }),
  }
);

const selectOrganQuestionRequestBodySchema =
  baseRequestBodyQuestionSchema.extend({
    type: z.literal("select-organ"),
    targetType: z.enum(["mesh", "group"], {
      required_error: "Target Type ('mesh' or 'group') is required",
    }),
    target_id: z
      .string({
        required_error: "target_id is required for select-organ questions.",
      })
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid target_id format. Must be a valid ObjectId string.",
      }),
    answers: z.array(selectOrganAnswerSchema),
  });

const shortAnswerQuestionRequestBodySchema =
  baseRequestBodyQuestionSchema.extend({
    type: z.literal("short-answer"),
    answers: z
      .array(answerSchema)
      .max(0, "Short answer questions should not have predefined answers."),
  });

const requestQuestionSchema = z.discriminatedUnion("type", [
  multipleChoiceQuestionRequestBodySchema,
  trueFalseQuestionRequestBodySchema,
  selectOrganQuestionRequestBodySchema,
  shortAnswerQuestionRequestBodySchema,
]);

// Main Quiz Schema for request body
const quizRequestBodySchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, { message: "Title must be at least 1 character long" }),
  description: z.string().trim().optional(),
  studyYear: z
    .number({ required_error: "Study year is required" })
    .int({ message: "Study year must be an integer" })
    .min(1, { message: "Study year must be a positive number" }),
  questions: z
    .array(requestQuestionSchema)
    .min(1, { message: "At least one question is required" }),
  scheduledAt: z
    .string()
    .datetime({ message: "Scheduled date must be in ISO 8601 format" })
    .optional()
    .nullable(),
});

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
 * - description: string (optional) - A description of the quiz.
 * - studyYear: number (required) - The study year of the quiz.
 * - questions: Array (required) - An array of question objects, each containing:
 *   - questionText: string (required) - The text of the question.
 *   - type: string (required) - The type of the question, either multiple-choice or select-organ.
 *   - answers: Array (optional) - An array of answer objects, each containing:
 *     - answerText: string (required) - The text of the answer.
 *     - isCorrect: boolean (optional) - Whether the answer is correct or not.
 *     - target_id: ObjectId (optional) - The ID of the selected organ, for select-organ questions only.
 *   - targetType: string (optional) - The type of the target, for select-organ questions only.
 * - scheduledAt: string (optional) - The ISO date string of when the quiz should be scheduled.
 *
 * The function validates the input data, ensuring required fields are present and have correct types.
 * If validation fails, it returns a 400 status with an error message. On success, it returns the created quiz data with a 201 status.
 * Logs and returns a 500 status with an error message if an exception occurs.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} The response containing the created quiz data or an error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();

    const validationResult = quizRequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.message,
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const quizData = {
      title: validatedData.title,
      description: validatedData.description,
      studyYear: validatedData.studyYear,
      questions: validatedData.questions.map((q) => {
        // Map to ensure only expected fields go into the DB model,
        // and convert target_id to ObjectId for select-organ.
        // Mongoose will generate _id for questions and answers.
        let questionPayload: any = {
          questionText: q.questionText,
          type: q.type,
          answers: q.answers || [], // Ensure answers is an array
        };
        if (q.type === "select-organ") {
          questionPayload.targetType = q.targetType;
          questionPayload.target_id = new Types.ObjectId(q.target_id); // Already validated as valid ObjectId string by Zod
        }
        return questionPayload;
      }),
      scheduledAt: validatedData.scheduledAt
        ? new Date(validatedData.scheduledAt)
        : null,
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
