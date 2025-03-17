import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Quiz from "@/app/models/Quiz";

/**
 * Handles GET requests to retrieve all quizzes from the database.
 *
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response
 * containing the list of quizzes and a status code of 200 on success, or an error
 * message with a status code of 500 on failure.
 */

export async function GET() {
  try {
    await dbConnect();
    const quizzes = await Quiz.find({});
    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get quizzes" },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new quiz in the database.
 *
 * @param {Request} req - The request object containing the quiz data in the body.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response
 * containing the created quiz and a status code of 201 on success, or an error
 * message with a status code of 400 on failure.
 */

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const quiz = new Quiz(body);
    await quiz.save();
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 400 }
    );
  }
}
