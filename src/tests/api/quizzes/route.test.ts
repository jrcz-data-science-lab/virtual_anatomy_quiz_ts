import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/quizzes/route";

describe("/api/quizzes route", () => {
  it("should return a list of quizzes", async () => {
    const req = new Request("http://localhost:3000/api/quizzes");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const quizzes = await res.json();
    expect(quizzes).toBeInstanceOf(Array);
    expect(quizzes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          studyYear: expect.any(Number),
          questions: expect.any(Array),
        }),
      ])
    );
  });

  it("should create a new quiz", async () => {
    const quizData = {
      title: "Digestive system quiz",
      description: "This is a new quiz",
      studyYear: 1,
      questions: [
        {
          questionText: "Test question about the stomach",
          type: "multiple-choice",
          answers: [
            { text: "Stomach", isCorrect: true },
            { text: "Not the stomach", isCorrect: false },
            { text: "Not the stomach again", isCorrect: false },
            { text: "Not the stomach again again", isCorrect: false },
          ],
        },
      ],
      scheduledAt: null, // Explicitly add scheduledAt as null since the API returns it
    };

    const req = new Request("http://localhost:3000/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const createdQuiz = await res.json();
    expect(createdQuiz).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        title: quizData.title,
        description: quizData.description,
        studyYear: quizData.studyYear,
        questions: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String), // Mongoose adds _id to subdocuments
            questionText: quizData.questions[0].questionText,
            type: quizData.questions[0].type,
            answers: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(String), // Mongoose adds _id to sub-subdocuments
                text: expect.any(String),
                isCorrect: expect.any(Boolean),
              }),
            ]),
          }),
        ]),
        __v: expect.any(Number), // Mongoose adds __v
        createdAt: expect.any(String), // Mongoose adds createdAt
        updatedAt: expect.any(String), // Mongoose adds updatedAt
        scheduledAt: null, // Expect null as per the provided quizData
      })
    );
  });

  it("should return an error response when creating a quiz with invalid data", async () => {
    const quizData = {
      title: "", // Invalid: too short
      description: "This is a new quiz for testing purposes",
      studyYear: 2025,
      questions: [
        {
          questionText: "Test question about the skeletal system",
          // Missing 'type' field, which is required for discrimination
          answers: [
            { text: "Paris", isCorrect: true },
            { text: "London", isCorrect: false },
          ],
        },
      ],
    };

    const req = new Request("http://localhost:3000/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const error = await res.json();
    expect(error).toEqual({
      error: expect.any(String), // This will be the stringified ZodError message
      details: {
        questions: [
          "Invalid discriminator value. Expected 'multiple-choice' | 'true-false' | 'select-organ' | 'short-answer'",
        ],
        title: ["Title must be at least 1 character long"],
      },
    });
  });

  it("should find all quizzes for a studyYear", async () => {
    const req = new Request("http://localhost:3000/api/quizzes?studyYear=1");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const quizzes = await res.json();
    expect(quizzes).toBeInstanceOf(Array);
    expect(quizzes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          studyYear: 1,
          questions: expect.any(Array),
        }),
      ])
    );
  });

  it("should create a new quiz with a select-organ question", async () => {
    const mockObjectId = "507f1f77bcf86cd799439011"; // A valid mock ObjectId
    const quizData = {
      title: "Select Organ Quiz",
      description: "Quiz on selecting specific organs or groups",
      studyYear: 2,
      questions: [
        {
          questionText: "Identify the correct mesh for the heart",
          type: "select-organ",
          targetType: "mesh",
          target_id: mockObjectId, // Using the mock ObjectId
          answers: [], // select-organ questions do not have predefined answers in the schema
        },
      ],
    };

    const req = new Request("http://localhost:3000/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toBe("application/json");

    const createdQuiz = await res.json();
    expect(createdQuiz).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        title: quizData.title,
        description: quizData.description,
        studyYear: quizData.studyYear,
        questions: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            questionText: quizData.questions[0].questionText,
            type: quizData.questions[0].type,
            targetType: quizData.questions[0].targetType,
            target_id: expect.any(String), // Mongoose converts ObjectId to string in lean()
          }),
        ]),
        __v: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        scheduledAt: null, // Since not provided in quizData
      })
    );
    // Further check that the target_id matches the expected mockObjectId after conversion
    expect(createdQuiz.questions[0].target_id).toBe(mockObjectId);
  });
});
