import { ApiReference } from "@scalar/nextjs-api-reference";

const specContent = {
  openapi: "3.0.0",
  info: {
    title: "Quiz Manager API",
    version: "1.0.0",
    description:
      "API for managing quizzes, submissions, and related medical mesh and organ group data.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  paths: {
    "/api/mesh-catalog": {
      get: {
        summary: "Get Mesh Catalog Items",
        description:
          "Retrieves a list of mesh catalog items. Supports searching by displayName or meshName, and exact matching for a specific meshName.",
        tags: ["Mesh Catalog"],
        parameters: [
          {
            name: "search",
            in: "query",
            description:
              "Search by displayName or meshName (case-insensitive).",
            schema: {
              type: "string",
            },
          },
          {
            name: "meshName",
            in: "query",
            description: "Get an exact match for a specific meshName.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "A list of mesh catalog items.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MeshCatalogItem",
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal Server Error",
          },
        },
      },
      post: {
        summary: "Create Mesh Catalog Item",
        description: "Adds a new MeshCatalogItem to the database.",
        tags: ["Mesh Catalog"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewMeshCatalogItem",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "The created mesh catalog item.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MeshCatalogItem",
                },
              },
            },
          },
          "500": {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/organ-groups": {
      get: {
        summary: "Get Organ Groups",
        description:
          "Retrieves a list of organ groups, optionally filtered by a search query on the group name.",
        tags: ["Organ Groups"],
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Search by groupName (case-insensitive).",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "A list of organ groups.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/OrganGroup",
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal Server Error",
          },
        },
      },
    },
    "/api/quizzes": {
      get: {
        summary: "Get Quizzes",
        description:
          "Retrieves quizzes, optionally filtered by study year and/or month.",
        tags: ["Quizzes"],
        parameters: [
          {
            name: "studyYear",
            in: "query",
            description: "Filter quizzes by study year.",
            schema: {
              type: "integer",
            },
          },
          {
            name: "month",
            in: "query",
            description: "Filter quizzes by scheduled month (format: YYYY-MM).",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "A list of quizzes.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Quiz",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a Quiz",
        description:
          "Creates a new quiz with a title, description, questions, and other details.",
        tags: ["Quizzes"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewQuiz",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "The created quiz.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Quiz",
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Validation failed.",
          },
        },
      },
    },
    "/api/quizzes/{id}": {
      get: {
        summary: "Get Quiz by ID",
        description: "Retrieves a single quiz by its unique ID.",
        tags: ["Quizzes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the quiz to retrieve.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The requested quiz.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Quiz",
                },
              },
            },
          },
          "404": {
            description: "Quiz not found.",
          },
        },
      },
      put: {
        summary: "Update a Quiz",
        description: "Updates an existing quiz by its ID.",
        tags: ["Quizzes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the quiz to update.",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewQuiz",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The updated quiz.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Quiz",
                },
              },
            },
          },
          "404": {
            description: "Quiz not found.",
          },
        },
      },
      delete: {
        summary: "Delete a Quiz",
        description: "Deletes a quiz by its ID.",
        tags: ["Quizzes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the quiz to delete.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Quiz deleted successfully.",
          },
          "404": {
            description: "Quiz not found.",
          },
        },
      },
    },
    "/api/quizzes/{id}/results": {
      get: {
        summary: "Get Quiz Results",
        description:
          "Retrieves the aggregated results and answer breakdowns for a specific quiz.",
        tags: ["Quizzes"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the quiz to get results for.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The quiz results.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/QuestionResult",
                  },
                },
              },
            },
          },
          "404": {
            description: "Quiz not found.",
          },
        },
      },
    },
    "/api/submissions": {
      get: {
        summary: "Get Submissions",
        description:
          "Retrieves a list of submissions, optionally filtered by quiz ID.",
        tags: ["Submissions"],
        parameters: [
          {
            name: "quiz_id",
            in: "query",
            description: "Filter submissions by a specific quiz ID.",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "A list of submissions.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Submission",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a Submission",
        description: "Creates a new submission for a quiz.",
        tags: ["Submissions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewSubmission",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "The created submission.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Submission",
                },
              },
            },
          },
          "400": {
            description: "Bad Request - Invalid data.",
          },
          "404": {
            description: "Quiz not found.",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      MeshCatalogItem: {
        type: "object",
        properties: {
          _id: { type: "string" },
          meshName: { type: "string" },
          displayName: { type: "string" },
          organGroupIds: { type: "array", items: { type: "string" } },
          defaultStudyYear: { type: "integer" },
        },
      },
      NewMeshCatalogItem: {
        type: "object",
        properties: {
          meshName: { type: "string" },
          displayName: { type: "string" },
          organGroupIds: { type: "array", items: { type: "string" } },
          defaultStudyYear: { type: "integer" },
        },
      },
      OrganGroup: {
        type: "object",
        properties: {
          _id: { type: "string" },
          groupName: { type: "string" },
          description: { type: "string" },
          defaultStudyYear: { type: "integer" },
        },
      },
      Answer: {
        type: "object",
        properties: {
          _id: { type: "string" },
          text: { type: "string" },
          isCorrect: { type: "boolean" },
        },
      },
      Question: {
        type: "object",
        properties: {
          _id: { type: "string" },
          questionText: { type: "string" },
          type: {
            type: "string",
            enum: [
              "multiple-choice",
              "true-false",
              "select-organ",
              "short-answer",
            ],
          },
          answers: {
            type: "array",
            items: { $ref: "#/components/schemas/Answer" },
          },
          targetType: { type: "string", enum: ["mesh", "group"] },
          target_id: { type: "string" },
        },
      },
      Quiz: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          studyYear: { type: "integer" },
          questions: {
            type: "array",
            items: { $ref: "#/components/schemas/Question" },
          },
          scheduledAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      NewQuiz: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          studyYear: { type: "integer" },
          questions: {
            type: "array",
            items: { $ref: "#/components/schemas/Question" },
          },
          scheduledAt: { type: "string", format: "date-time" },
        },
      },
      SubmissionAnswer: {
        type: "object",
        properties: {
          question_id: { type: "string" },
          selectedAnswerId_Index: { type: "integer" },
          responseText_ClickedMesh_id: { type: "string" },
          responseText_ShortAnswer: { type: "string" },
        },
      },
      Submission: {
        type: "object",
        properties: {
          _id: { type: "string" },
          quiz_id: { type: "string" },
          student_id: { type: "string" },
          studyYearAtSubmission: { type: "integer" },
          submittedAt: { type: "string", format: "date-time" },
          answers: {
            type: "array",
            items: { $ref: "#/components/schemas/SubmissionAnswer" },
          },
        },
      },
      NewSubmission: {
        type: "object",
        properties: {
          quiz_id: { type: "string" },
          student_id: { type: "string" },
          studyYearAtSubmission: { type: "integer" },
          submittedAt: { type: "string", format: "date-time" },
          answers: {
            type: "array",
            items: { $ref: "#/components/schemas/SubmissionAnswer" },
          },
        },
      },
      AnswerBreakdown: {
        type: "object",
        properties: {
          answerText: { type: "string" },
          studentCount: { type: "integer" },
          isCorrectOption: { type: "boolean" },
        },
      },
      QuestionResult: {
        type: "object",
        properties: {
          questionId: { type: "string" },
          questionText: { type: "string" },
          questionType: { type: "string" },
          totalSubmissionsForQuestion: { type: "integer" },
          totalCorrect: { type: "integer" },
          answersBreakdown: {
            type: "array",
            items: { $ref: "#/components/schemas/AnswerBreakdown" },
          },
          submittedTextAnswers: { type: "array", items: { type: "string" } },
          correctTargetDisplayName: { type: "string" },
        },
      },
    },
  },
};

export const GET = ApiReference({
  spec: {
    content: specContent,
  },
} as any);
