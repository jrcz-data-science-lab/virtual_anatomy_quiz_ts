import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/app/lib/dbConnect";
import Quiz from "@/app/models/Quiz";

/**
 * Handles GET and POST requests to /api/quizzes
 *
 * GET /api/quizzes: Returns a list of all quizzes
 *
 * POST /api/quizzes: Creates a new quiz with the provided body
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 * @returns {Promise<Response>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    const quizzes = await Quiz.find({});
    return res.status(200).json(quizzes);
  }

  if (req.method === "POST") {
    try {
      const quiz = new Quiz(req.body);
      await quiz.save();
      return res.status(201).json(quiz);
    } catch (error) {
      return res.status(400).json({ error: "Failed to create quiz" });
    }
  }

  return res.status(405).end();
}
