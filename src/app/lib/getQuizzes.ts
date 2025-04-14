import dbConnect from "./dbConnect";
import { Quiz } from "@/app/models/Quiz";

/**
 * Retrieves all quizzes from the database.
 *
 * The function first connects to the database using the {@link dbConnect} function.
 * Then, it performs a `find` query on the `Quiz` model to retrieve all quizzes, sorted
 * in descending order by creation date. The `lean` method is used to retrieve plain
 * JavaScript objects instead of Mongoose documents. If the query is successful, the
 * function returns an array of quizzes. Otherwise, it logs an error and returns an
 * empty array.
 *
 * @returns {Promise<IQuiz[]>} A promise that resolves with an array of quizzes, or an
 * empty array if the query fails.
 */
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
