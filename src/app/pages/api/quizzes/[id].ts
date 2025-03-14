import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/app/lib/dbConnect";
import Quiz from "@/app/models/Quiz";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === "GET") {
    const quiz = await Quiz.findById(id);
    return res.status(200).json(quiz);
  }

  if (req.method === "PUT") {
    try {
      const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json(updatedQuiz);
    } catch (error) {
      return res.status(400).json({ error: "Failed to update quiz" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await Quiz.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(400).json({ error: "Failed to delete quiz" });
    }
  }

  return res.status(405).end();
}
