import dbConnect from "./dbConnect";
import Quiz, { IQuiz } from "@/app/models/Quiz";

export async function getQuizzes() {
  try {
    await dbConnect();
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
    return quizzes;
  } catch (error) {
    console.error("Failed to get quizzes", error);
    return [];
  }
}
