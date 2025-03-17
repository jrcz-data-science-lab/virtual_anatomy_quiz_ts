import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Quiz from "@/app/models/Quiz";

/**
 * Handles GET requests to retrieve a quiz by id from the database.
 *
 * @param {Request} req - The request object containing the id in the params.
 * @param {{ params: { id: string } }} params - The params object containing the quiz id.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the quiz and a status code of 200 on success, or an error message with a status code of
 * 404 if the quiz is not found, or an error message with a status code of 500 on failure.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const quiz = await Quiz.findById(params.id);
    if (!quiz)
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get quiz" }, { status: 500 });
  }
}
