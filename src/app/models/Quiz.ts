import mongoose, { Schema, Document } from "mongoose";

interface IQuestion {
  question: string;
  type: "multiple-choice" | "true-false" | "select-organ" | "short-answer";
  options?: string[];
  correctAnswer?: string;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  // status?: "Planned" | "In Progress" | "Completed";
  questions: IQuestion[];
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: [String], required: false },
  correctAnswer: { type: String, required: false },
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
    scheduledAt: { type: Date, required: false, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Quiz ||
  mongoose.model<IQuiz>("Quiz", QuizSchema);
