import mongoose, { Schema, Document } from "mongoose";

interface IAnswer {
  text: String;
  isCorrect: Boolean;
}

interface IQuestion {
  question: string;
  type: "multiple-choice" | "true-false" | "select-organ" | "short-answer";
  answers?: IAnswer[];
  expectedOrganId?: string; // for select-organ type
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

const AnswerSchema = new Schema<IAnswer>({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, required: true },
  answers: { type: [AnswerSchema], required: false },
  // correctAnswer: { type: String, required: false },
  expectedOrganId: { type: String, required: false }, // for select-organ type
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
