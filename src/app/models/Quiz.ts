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

// Quiz document
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

export const Quiz =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);

// Organ document
export interface IOrgan extends Document {
  displayName: string;
  meshName: string;
  region: string;
}

const OrganSchema = new Schema<IOrgan>({
  displayName: { type: String, required: true },
  meshName: { type: String, required: true },
  region: { type: String, required: false },
});

export const Organ =
  mongoose.models.Organ || mongoose.model<IOrgan>("Organ", OrganSchema);

// Student document
export interface IStudent extends Document {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

// Submission document
export interface ISubmissionAnswer {
  questionId: string;
  selectedAnswerId?: number;
  textResponse?: string;
}

export interface ISubmission extends Document {
  studentId?: string;
  quizId: string;
  submittedAt: Date;
  answers: ISubmissionAnswer[];
}

const SubmissionAnswerSchema = new Schema<ISubmissionAnswer>(
  {
    questionId: { type: String, required: true },
    selectedAnswerId: { type: Number, required: false },
    textResponse: { type: String, required: false },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: String, required: false },
    quizId: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    answers: { type: [SubmissionAnswerSchema], required: true },
    // score: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Submission =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

// export const SubmissionAnswer =
//   mongoose.models.SubmissionAnswer ||
//   mongoose.model<ISubmissionAnswer>("SubmissionAnswer", SubmissionAnswerSchema);
