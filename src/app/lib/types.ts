export interface OrganClient {
  _id: string;
  displayName: string;
}

export interface MeshCatalogItemMin {
  _id: string;
  displayName: string;
  meshName: string;
}

export interface OrganGroupMin {
  _id: string;
  groupName: string; // This is the display name for groups
}

// Update frontend Question interface (used in EditQuizForm state)
export interface FrontendAnswer {
  _id?: string; // Existing or new answer
  text: string;
  isCorrect: boolean;
}

export interface FrontendQuestion {
  _id?: string; // Existing or new question
  questionText: string;
  type: string; // "multiple-choice", "true-false", "select-organ", "short-answer"
  answers: FrontendAnswer[];
  targetType?: "mesh" | "group";
  target_id?: string; // Stores ObjectId as string
}
