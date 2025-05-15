import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Quiz } from "@/app/models/Quiz";
import { isContext } from "vm";

/**
 * Handles GET requests to retrieve a quiz by id from the database.
 *
 * @param {{ params: Promise<{ id: string }> }} props - The props object containing the quiz id.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the quiz and a status code of 200 on success, a status code of 404 if the quiz is not
 * found, or a status code of 500 on failure.
 */
export async function GET(props: {
  params: Promise<{ id: string }>;
}): Promise<NextResponse> {
  const params = await props.params;
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

/**
 * Handles PUT requests to update a quiz by id in the database.
 *
 * @param {Request} req - The request object containing the updated quiz data in the body.
 * @param {{ params: Promise<{ id: string }> }} props - The props object containing the quiz id.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the updated quiz and a status code of 200 on success, or an error message with a status
 * code of 404 if the quiz is not found, or an error message with a status code of 500 on failure.
 */
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await props.params;
  await dbConnect();
  const id = params.id;

  try {
    const body = await req.json();
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, body, { new: true });

    if (!updatedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(updatedQuiz, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to delete a quiz by id from the database.
 *
 * @param {Request} req - The request object.
 * @param {{ params: Promise<{ id: string }> }} context - The context object containing the quiz id.
 * @returns {Promise<NextResponse>} A promise that resolves with a JSON response containing
 * the deleted quiz and a status code of 200 on success, or an error message with a status
 * code of 404 if the quiz is not found, or an error message with a status code of 500 on failure.
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  await dbConnect();
  const { id } = await context.params;

  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    if (!deletedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(deletedQuiz, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
