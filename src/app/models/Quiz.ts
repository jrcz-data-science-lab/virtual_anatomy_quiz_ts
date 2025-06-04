import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMeshCatalogItem extends Document {
  meshName: string; // e.g., "bones_Fourth_Rib_L"
  displayName: string; // e.g., "Fourth Rib (L)"
  organGroupIds?: Types.ObjectId[]; // References OrganGroup._id
  defaultStudyYear?: number;
}

const MeshCatalogSchema = new Schema<IMeshCatalogItem>({
  meshName: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  organGroupIds: [{ type: Schema.Types.ObjectId, ref: "OrganGroup" }],
  defaultStudyYear: { type: Number },
});

export const MeshCatalogItem =
  mongoose.models.MeshCatalogItem ||
  mongoose.model<IMeshCatalogItem>("MeshCatalogItem", MeshCatalogSchema);

export interface IOrganGroup extends Document {
  groupName: string; // e.g., "Leg", "Thoracic Cage"
  description?: string;
  defaultStudyYear?: number;
}

const OrganGroupSchema = new Schema<IOrganGroup>({
  groupName: { type: String, required: true, unique: true },
  description: { type: String },
  defaultStudyYear: { type: Number },
});

export const OrganGroup =
  mongoose.models.OrganGroup ||
  mongoose.model<IOrganGroup>("OrganGroup", OrganGroupSchema);

interface IAnswer {
  _id?: Types.ObjectId;
  text: string;
  isCorrect: boolean;
}

const AnswerSchema = new Schema<IAnswer>({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

export interface IQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  type: "multiple-choice" | "true-false" | "select-organ" | "short-answer";
  answers?: IAnswer[]; // For MCQ/TF

  // For type: "select-organ"
  targetType?: "mesh" | "group";
  target_id?: Types.ObjectId;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["multiple-choice", "true-false", "select-organ", "short-answer"],
  },
  answers: { type: [AnswerSchema], default: undefined },
  targetType: { type: String, enum: ["mesh", "group"], default: undefined },
  target_id: { type: Schema.Types.ObjectId, default: undefined }, // Ref depends on targetType, handled in app logic
});

export interface IQuiz extends Document {
  title: string;
  description?: string;
  studyYear: number; // The overall intended study year for this quiz
  questions: IQuestion[];
  scheduledAt?: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    studyYear: { type: Number, required: true, index: true },
    questions: { type: [QuestionSchema], required: true },
    scheduledAt: { type: Date, required: false },
  },
  { timestamps: true }
);

export const Quiz =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);

export interface ISubmissionAnswer {
  question_id: Types.ObjectId;
  selectedAnswerId_Index?: number; // For MCQ/TF
  responseText_ClickedMesh_id?: Types.ObjectId; // For "select-organ", references MeshCatalogItem._id
  responseText_ShortAnswer?: string; // For "short-answer"
}

const SubmissionAnswerSchema = new Schema<ISubmissionAnswer>(
  {
    question_id: { type: Schema.Types.ObjectId, required: true },
    selectedAnswerId_Index: { type: Number },
    responseText_ClickedMesh_id: {
      type: Schema.Types.ObjectId,
      ref: "MeshCatalogItem",
    },
    responseText_ShortAnswer: { type: String },
  },
  { _id: false }
);

export interface ISubmission extends Document {
  quiz_id: Types.ObjectId; // References Quiz._id
  student_id?: string;
  studyYearAtSubmission: number; // Study year chosen by student in UE
  submittedAt: Date;
  answers: ISubmissionAnswer[];
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    quiz_id: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    student_id: { type: String, index: true },
    studyYearAtSubmission: { type: Number, required: true },
    submittedAt: { type: Date, required: true, default: Date.now },
    answers: { type: [SubmissionAnswerSchema], required: true },
  },
  { timestamps: true }
);

export const Submission =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export interface IStudent extends Document {
  name: string;
  email: string;
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
