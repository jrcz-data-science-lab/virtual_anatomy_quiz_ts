import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { GET, POST } from "@/app/api/submissions/route";
import {
  Quiz,
  Submission,
  MeshCatalogItem,
  OrganGroup,
} from "@/app/models/Quiz";
import mongoose from "mongoose";

// Mock Mongoose models
vi.mock("@/app/models/Quiz", () => {
  // Create a mock constructor function for Submission
  const SubmissionMock = vi.fn();
  // Attach a mock static 'find' method to the constructor
  (SubmissionMock as any).find = vi.fn();

  return {
    Quiz: {
      findById: vi.fn(),
    },
    Submission: SubmissionMock, // Use the mock that has both constructor and static methods
    MeshCatalogItem: {},
    OrganGroup: {},
  };
});

// Mock dbConnect
vi.mock("@/app/lib/dbConnect", () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe("/api/submissions route", () => {
  const mockQuizId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const mockQuestionId1 = new mongoose.Types.ObjectId(
    "507f1f77bcf86cd799439012"
  );
  const mockQuestionId2 = new mongoose.Types.ObjectId(
    "507f1f77bcf86cd799439013"
  );

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock for Quiz.findById().countDocuments() for POST requests
    (Quiz.findById as Mock).mockReturnValue({
      countDocuments: vi.fn().mockResolvedValue(1),
    });

    // Mock for the static Submission.find() for GET requests
    (Submission.find as Mock).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    });

    // Mock for the constructor 'new Submission(data).save()' for POST requests
    const save = vi.fn().mockImplementation(function (this: any) {
      // Mongoose's save returns a promise that resolves to the document itself.
      return Promise.resolve(this);
    });

    (Submission as unknown as Mock).mockImplementation((data: any) => ({
      ...data,
      _id: new mongoose.Types.ObjectId(),
      save,
    }));
  });

  describe("POST /api/submissions", () => {
    it("should create a new submission successfully", async () => {
      const submissionData = {
        quiz_id: mockQuizId.toHexString(),
        studyYearAtSubmission: 1,
        submittedAt: new Date().toISOString(),
        answers: [
          {
            question_id: mockQuestionId1.toHexString(),
            selectedAnswerId_Index: 0,
          },
        ],
      };

      const req = new Request("http://localhost:3000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const res = await POST(req);

      expect(res.status).toBe(201);
      const responseBody = await res.json();
      expect(responseBody.success).toBe(true);
      expect(responseBody.submissionId).toBeDefined(); // This will now pass
    });

    it("should return 400 for invalid or missing quiz_id", async () => {
      const submissionData = {
        // quiz_id: missing
        studyYearAtSubmission: 1,
      };

      const req = new Request("http://localhost:3000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 for missing studyYearAtSubmission", async () => {
      const submissionData = {
        quiz_id: mockQuizId.toHexString(),
        // studyYearAtSubmission: missing
      };

      const req = new Request("http://localhost:3000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 400 for missing answers array", async () => {
      const submissionData = {
        quiz_id: mockQuizId.toHexString(),
        studyYearAtSubmission: 1,
        submittedAt: new Date().toISOString(),
        // answers: missing
      };

      const req = new Request("http://localhost:3000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 404 if quiz not found", async () => {
      (Quiz.findById as Mock).mockReturnValue({
        countDocuments: vi.fn().mockResolvedValue(0), // Quiz not found
      });

      const submissionData = {
        quiz_id: new mongoose.Types.ObjectId().toHexString(),
        studyYearAtSubmission: 1,
        submittedAt: new Date().toISOString(),
        answers: [
          {
            question_id: mockQuestionId1.toHexString(),
            selectedAnswerId_Index: 0,
          },
        ],
      };

      const req = new Request("http://localhost:3000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const res = await POST(req);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/submissions", () => {
    it("should return an empty array if no submissions are found", async () => {
      const req = new Request("http://localhost:3000/api/submissions");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody.data).toEqual([]);
    });

    it("should return a list of all submissions", async () => {
      const mockSubmissions = [
        {
          _id: new mongoose.Types.ObjectId(),
          studyYearAtSubmission: 1,
          quiz_id: { _id: mockQuizId, title: "Mock Quiz 1" },
        },
      ];
      (Submission.find as Mock).mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockSubmissions),
      });

      const req = new Request("http://localhost:3000/api/submissions");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody.data).toHaveLength(1);
      expect(responseBody.data[0].studyYearAtSubmission).toBe(1);
    });

    it("should return a filtered list of submissions by quiz_id", async () => {
      const req = new Request(
        `http://localhost:3000/api/submissions?quiz_id=${mockQuizId.toHexString()}`
      );
      await GET(req);
      expect(Submission.find).toHaveBeenCalledWith({ quiz_id: mockQuizId });
    });

    it("should return 200 for invalid quiz_id format in filter", async () => {
      const req = new Request(
        "http://localhost:3000/api/submissions?quiz_id=invalid"
      );
      const res = await GET(req);
      expect(res.status).toBe(200);
      const responseBody = await res.json();
      expect(responseBody.data).toEqual([]);
    });
  });
});
