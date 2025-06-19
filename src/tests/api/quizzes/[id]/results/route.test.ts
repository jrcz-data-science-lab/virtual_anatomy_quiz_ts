import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { GET } from "@/app/api/quizzes/[id]/results/route";
import {
  Quiz,
  Submission,
  MeshCatalogItem,
  OrganGroup,
} from "@/app/models/Quiz";
import mongoose from "mongoose";

// Mock Mongoose models
vi.mock("@/app/models/Quiz", () => ({
  Quiz: {
    findById: vi.fn(),
  },
  Submission: {
    find: vi.fn(),
  },
  MeshCatalogItem: {
    find: vi.fn(),
  },
  OrganGroup: {
    find: vi.fn(),
  },
}));

// Mock dbConnect
vi.mock("@/app/lib/dbConnect", () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe("/api/quizzes/[id]/results route", () => {
  const mockQuizId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const mockQuestionIdMCQ = new mongoose.Types.ObjectId(
    "507f1f77bcf86cd799439012"
  );
  const mockQuestionIdSA = new mongoose.Types.ObjectId(
    "507f1f77bcf86cd799439013"
  );
  const mockQuestionIdSO = new mongoose.Types.ObjectId(
    "507f1f77bcf86cd799439014"
  ); // Select Organ question

  const mockMeshId1 = new mongoose.Types.ObjectId("607f1f77bcf86cd799439001");
  const mockMeshId2 = new mongoose.Types.ObjectId("607f1f77bcf86cd799439002");
  const mockGroupId1 = new mongoose.Types.ObjectId("707f1f77bcf86cd799439001");

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for chained queries
    (Quiz.findById as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    (Submission.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });
    (MeshCatalogItem.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });
    (OrganGroup.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });
  });

  it("should return 400 for invalid quiz ID format", async () => {
    const req = new Request(
      "http://localhost:3000/api/quizzes/invalid_id/results"
    );
    const res = await GET(req, { params: { id: "invalid_id" } });

    expect(res.status).toBe(400);
    const errorBody = await res.json();
    expect(errorBody.error).toContain("Invalid Quiz ID format");
  });

  it("should return 404 if quiz not found", async () => {
    (Quiz.findById as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    const req = new Request(
      `http://localhost:3000/api/quizzes/${mockQuizId.toHexString()}/results`
    );
    const res = await GET(req, { params: { id: mockQuizId.toHexString() } });

    expect(res.status).toBe(404);
    const errorBody = await res.json();
    expect(errorBody.error).toContain("Quiz not found");
  });

  it("should return quiz results for a multiple-choice question", async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: "Test Quiz MCQ",
      questions: [
        {
          _id: mockQuestionIdMCQ,
          questionText: "What is 2 + 2?",
          type: "multiple-choice",
          answers: [
            { text: "3", isCorrect: false },
            { text: "4", isCorrect: true },
            { text: "5", isCorrect: false },
          ],
        },
      ],
    };

    const mockSubmissions = [
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          { question_id: mockQuestionIdMCQ, selectedAnswerId_Index: 1 },
        ], // Correct
      },
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          { question_id: mockQuestionIdMCQ, selectedAnswerId_Index: 0 },
        ], // Incorrect
      },
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          { question_id: mockQuestionIdMCQ, selectedAnswerId_Index: 1 },
        ], // Correct
      },
    ];

    (Quiz.findById as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockQuiz),
    });
    (Submission.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubmissions),
    });

    const req = new Request(
      `http://localhost:3000/api/quizzes/${mockQuizId.toHexString()}/results`
    );
    const res = await GET(req, { params: { id: mockQuizId.toHexString() } });

    expect(res.status).toBe(200);
    const results = await res.json();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      questionId: mockQuestionIdMCQ.toHexString(),
      questionText: "What is 2 + 2?",
      questionType: "multiple-choice",
      totalSubmissionsForQuestion: 3,
      totalCorrect: 2,
      answersBreakdown: expect.arrayContaining([
        { answerText: "3", studentCount: 1, isCorrectOption: false },
        { answerText: "4", studentCount: 2, isCorrectOption: true },
        { answerText: "5", studentCount: 0, isCorrectOption: false },
      ]),
    });
  });

  it("should return quiz results for a short-answer question", async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: "Test Quiz SA",
      questions: [
        {
          _id: mockQuestionIdSA,
          questionText: "Explain respiration",
          type: "short-answer",
          answers: [],
        },
      ],
    };

    const mockSubmissions = [
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSA,
            responseText_ShortAnswer: "Breathing",
          },
        ],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSA,
            responseText_ShortAnswer: "Gas exchange",
          },
        ],
      },
    ];

    (Quiz.findById as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockQuiz),
    });
    (Submission.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubmissions),
    });

    const req = new Request(
      `http://localhost:3000/api/quizzes/${mockQuizId.toHexString()}/results`
    );
    const res = await GET(req, { params: { id: mockQuizId.toHexString() } });

    expect(res.status).toBe(200);
    const results = await res.json();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      questionId: mockQuestionIdSA.toHexString(),
      questionText: "Explain respiration",
      questionType: "short-answer",
      totalSubmissionsForQuestion: 2,
      totalCorrect: 0, // Short answer has no predefined correct count in the API
      answersBreakdown: [], // Short answer does not have answer breakdown
      submittedTextAnswers: expect.arrayContaining([
        "Breathing",
        "Gas exchange",
      ]),
    });
  });

  it("should return quiz results for a select-organ (mesh) question", async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: "Test Quiz SO Mesh",
      questions: [
        {
          _id: mockQuestionIdSO,
          questionText: "Select the heart mesh",
          type: "select-organ",
          targetType: "mesh",
          target_id: mockMeshId1, // Correct mesh
          answers: [],
        },
      ],
    };

    const mockSubmissions = [
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSO,
            responseText_ClickedMesh_id: mockMeshId1,
          },
        ], // Correct
      },
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSO,
            responseText_ClickedMesh_id: mockMeshId2,
          },
        ], // Incorrect
      },
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSO,
            responseText_ClickedMesh_id: mockMeshId1,
          },
        ], // Correct
      },
    ];

    const mockMeshCatalogItems = [
      { _id: mockMeshId1, meshName: "heart_mesh", displayName: "Heart" },
      { _id: mockMeshId2, meshName: "lung_mesh", displayName: "Lung" },
    ];

    (Quiz.findById as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockQuiz),
    });
    (Submission.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubmissions),
    });
    (MeshCatalogItem.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockMeshCatalogItems),
    });

    const req = new Request(
      `http://localhost:3000/api/quizzes/${mockQuizId.toHexString()}/results`
    );
    const res = await GET(req, { params: { id: mockQuizId.toHexString() } });

    expect(res.status).toBe(200);
    const results = await res.json();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      questionId: mockQuestionIdSO.toHexString(),
      questionText: "Select the heart mesh",
      questionType: "select-organ",
      totalSubmissionsForQuestion: 3,
      totalCorrect: 2,
      correctTargetDisplayName: "Heart",
      answersBreakdown: expect.arrayContaining([
        { answerText: "Heart", studentCount: 2, isCorrectOption: true },
        { answerText: "Lung", studentCount: 1, isCorrectOption: false },
      ]),
    });
  });

  it("should return quiz results for a select-organ (group) question", async () => {
    const mockQuiz = {
      _id: mockQuizId,
      title: "Test Quiz SO Group",
      questions: [
        {
          _id: mockQuestionIdSO,
          questionText: "Select a bone from the upper limb group",
          type: "select-organ",
          targetType: "group",
          target_id: mockGroupId1, // Upper Limb Group ID
          answers: [],
        },
      ],
    };

    const mockSubmissions = [
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSO,
            responseText_ClickedMesh_id: mockMeshId1,
          },
        ], // Mesh in group
      },
      {
        _id: new mongoose.Types.ObjectId(),
        quiz_id: mockQuizId,
        answers: [
          {
            question_id: mockQuestionIdSO,
            responseText_ClickedMesh_id: mockMeshId2,
          },
        ], // Mesh NOT in group
      },
    ];

    const mockMeshCatalogItems = [
      {
        _id: mockMeshId1,
        meshName: "radius_L",
        displayName: "Radius (L)",
        organGroupIds: [mockGroupId1],
      },
      {
        _id: mockMeshId2,
        meshName: "femur_L",
        displayName: "Femur (L)",
        organGroupIds: [new mongoose.Types.ObjectId()],
      },
    ];
    const mockOrganGroups = [{ _id: mockGroupId1, groupName: "Upper Limb" }];

    (Quiz.findById as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockQuiz),
    });
    (Submission.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockSubmissions),
    });
    (MeshCatalogItem.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockMeshCatalogItems),
    });
    (OrganGroup.find as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockOrganGroups),
    });

    const req = new Request(
      `http://localhost:3000/api/quizzes/${mockQuizId.toHexString()}/results`
    );
    const res = await GET(req, { params: { id: mockQuizId.toHexString() } });

    expect(res.status).toBe(200);
    const results = await res.json();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      questionId: mockQuestionIdSO.toHexString(),
      questionText: "Select a bone from the upper limb group",
      questionType: "select-organ",
      totalSubmissionsForQuestion: 2,
      totalCorrect: 1, // Only mockMeshId1 is correct
      correctTargetDisplayName: "Upper Limb",
      answersBreakdown: expect.arrayContaining([
        { answerText: "Radius (L)", studentCount: 1, isCorrectOption: true },
        { answerText: "Femur (L)", studentCount: 1, isCorrectOption: false },
      ]),
    });
  });
});
