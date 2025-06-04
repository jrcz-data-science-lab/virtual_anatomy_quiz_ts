"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { DateTimePicker24h } from "../components/DateTimePicker";
import { MeshCatalogCombobox } from "../components/MeshCatalogCombobox";
import { OrganGroupCombobox } from "../components/OrganGroupCombobox";
import { useWarnIfUnsavedChanges } from "@/app/lib/warnIfUnsavedChanges";

export interface FrontendAnswer {
  // No _id needed for new answers during creation, Mongoose will add it.
  text: string;
  isCorrect: boolean;
}

export interface FrontendQuestion {
  questionText: string;
  type: string;
  answers: FrontendAnswer[];
  targetType?: "mesh" | "group";
  target_id?: string;
}

interface QuizCreateState {
  title: string;
  description: string;
  studyYear?: number;
  questions: FrontendQuestion[];
  scheduledAt?: Date;
}

/**
 * Handles changes to any field in the quiz state object.
 * This function takes a key (of the quiz state object) and a value
 * and uses the useState setter function to update the state.
 * The first argument should be a key of the QuizCreateState interface,
 * and the second argument should be a value of the corresponding type.
 * The function also sets hasUnsavedChanges to true.
 */
export default function CreateQuizPage(): JSX.Element {
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [quiz, setQuiz] = useState<QuizCreateState>({
    title: "",
    description: "",
    studyYear: undefined,
    questions: [],
    scheduledAt: undefined,
  });
  const [loading, setLoading] = useState(false);

  useWarnIfUnsavedChanges(hasUnsavedChanges);

  /**
   * Returns an array of default answers based on the question type.
   * For multiple-choice questions, returns 4 empty answer objects.
   * For true-false questions, returns 2 answer objects with "True" and "False"
   * as the text and isCorrect set to false.
   * For any other type, returns an empty array.
   * @param {string} type The type of the question.
   * @returns {FrontendAnswer[]} An array of default answers.
   */
  const createDefaultAnswers = (type: string): FrontendAnswer[] => {
    if (type === "multiple-choice") {
      return [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    }
    if (type === "true-false") {
      return [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: false },
      ];
    }
    return [];
  };

  /**
   * Handles changes to any field in the quiz state object.
   * This function takes a key (of the quiz state object) and a value
   * and uses the useState setter function to update the state.
   * The first argument should be a key of the QuizCreateState interface,
   * and the second argument should be a value of the corresponding type.
   * The function also sets hasUnsavedChanges to true.
   */
  const handleQuizChange = (
    field: keyof QuizCreateState,
    value: string | number | Date | undefined | FrontendQuestion[]
  ) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Updates the studyYear field in the quiz state.
   *
   * This function takes a string value, converts it to an integer,
   * and updates the studyYear field in the quiz state. If the value is empty,
   * the studyYear is set to undefined. It also marks the form as having unsaved changes.
   *
   * @param {string} value - The new value for the studyYear field.
   */
  const handleStudyYearChange = (value: string) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      studyYear: value ? parseInt(value) : undefined,
    }));
  };

  // --- Question Handlers ---

  /**
   * Adds a new question to the quiz state.
   *
   * This function sets hasUnsavedChanges to true and appends a new
   * FrontendQuestion object to the questions array in the quiz state.
   * The new question has default values for all fields.
   */
  const handleAddQuestion = () => {
    setHasUnsavedChanges(true);
    const defaultNewQuestionType = "true-false";

    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          type: defaultNewQuestionType,
          answers: createDefaultAnswers(defaultNewQuestionType),
          targetType: undefined,
          target_id: undefined,
        },
      ],
    }));
  };

  /**
   * Removes a question from the quiz state.
   *
   * This function takes the index of the question to remove, sets hasUnsavedChanges to true,
   * and updates the questions array in the quiz state by removing the question at the given index.
   *
   * @param {number} qIndex - The index of the question to remove.
   */
  const handleRemoveQuestion = (qIndex: number) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== qIndex),
    }));
  };

  /**
   * Updates a single field of a single question in the quiz state.
   *
   * This function takes the index of the question to update, the field to update, and the new value.
   * It sets hasUnsavedChanges to true and updates the questions array in the quiz state by
   * updating the question at the given index with the new value for the given field.
   *
   * @template {keyof FrontendQuestion} K - The type of the field to update.
   * @param {number} qIndex - The index of the question to update.
   * @param {K} field - The field to update.
   * @param {FrontendQuestion[K]} value - The new value for the given field.
   */
  const handleQuestionDetailChange = <K extends keyof FrontendQuestion>(
    qIndex: number,
    field: K,
    value: FrontendQuestion[K]
  ) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex ? { ...q, [field]: value } : q
      ),
    }));
  };

  /**
   * Handles changes to the type of a question in the quiz state.
   *
   * This function takes the index of the question and the new type.
   * It sets hasUnsavedChanges to true and updates the questions array in the quiz state by
   * updating the question at the given index with the new type.
   * If the new type is "select-organ", the targetType and target_id fields are reset to undefined.
   * If the new type is not "multiple-choice" or "true-false", the answers field is reset to an empty array.
   *
   * @param {number} qIndex - The index of the question to update.
   * @param {string} newType - The new type of the question.
   */
  const handleQuestionTypeChange = (qIndex: number, newType: string) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
              ...q,
              type: newType,
              targetType: newType === "select-organ" ? q.targetType : undefined,
              target_id: newType === "select-organ" ? q.target_id : undefined,
              answers:
                newType === "multiple-choice" || newType === "true-false"
                  ? q.answers
                  : [],
            }
          : q
      ),
    }));
  };

  // --- Answer Handlers (for MCQ/TF) ---

  /**
   * Adds a new answer to the question at the given index in the quiz state.
   *
   * This function takes the index of the question to add an answer to.
   * It sets hasUnsavedChanges to true and updates the questions array in the quiz state by
   * adding a new answer to the question at the given index.
   * The new answer has a default text of "" and isCorrect of false.
   *
   * @param {number} qIndex - The index of the question to add an answer to.
   */
  const handleAddAnswer = (qIndex: number) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? { ...q, answers: [...q.answers, { text: "", isCorrect: false }] }
          : q
      ),
    }));
  };

  /**
   * Removes an answer from a specific question in the quiz state.
   *
   * This function takes the index of the question and the index of the answer
   * to be removed. It sets hasUnsavedChanges to true and updates the quiz state
   * by removing the specified answer from the answers array of the targeted question.
   *
   * @param {number} qIndex - The index of the question containing the answer.
   * @param {number} ansIndex - The index of the answer to be removed.
   */
  const handleRemoveAnswer = (qIndex: number, ansIndex: number) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? { ...q, answers: q.answers.filter((_, i) => i !== ansIndex) }
          : q
      ),
    }));
  };

  /**
   * Updates the text of a specific answer of a specific question in the quiz state.
   *
   * This function takes the index of the question, the index of the answer to be updated, and the new text.
   * It sets hasUnsavedChanges to true and updates the questions array in the quiz state by
   * updating the specified answer of the targeted question with the new text.
   *
   * @param {number} qIndex - The index of the question containing the answer.
   * @param {number} ansIndex - The index of the answer to be updated.
   * @param {string} text - The new text of the answer.
   */
  const handleAnswerTextChange = (
    qIndex: number,
    ansIndex: number,
    text: string
  ) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
              ...q,
              answers: q.answers.map((ans, aIdx) =>
                aIdx === ansIndex ? { ...ans, text } : ans
              ),
            }
          : q
      ),
    }));
  };

  /**
   * Sets the correct answer for a specific question in the quiz state.
   *
   * This function takes the index of the question and the index of the answer to be set as correct.
   * It sets hasUnsavedChanges to true and updates the questions array in the quiz state by
   * setting the isCorrect field of the specified answer of the targeted question to true and
   * setting the isCorrect field of all other answers of the targeted question to false.
   *
   * @param {number} qIndex - The index of the question to update.
   * @param {number} ansIndex - The index of the answer to be set as correct.
   */
  const handleSetCorrectAnswer = (qIndex: number, ansIndex: number) => {
    setHasUnsavedChanges(true);
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
              ...q,
              answers: q.answers.map((ans, aIdx) => ({
                ...ans,
                isCorrect: aIdx === ansIndex,
              })),
            }
          : q
      ),
    }));
  };

  // --- Form Submission ---

  /**
   * Handles form submission by sending a POST request to the server
   * with the updated quiz data. If the request is successful, it
   * displays a success toast message and resets the form. If the
   * request fails, it displays an error toast message.
   * @param {React.FormEvent} e The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (quiz.studyYear === undefined) {
      toast.error("Please select a study year for the quiz.");
      setLoading(false);
      return;
    }
    if (quiz.questions.some((q) => !q.questionText.trim())) {
      toast.error("Please ensure all questions have text.");
      setLoading(false);
      return;
    }
    if (
      quiz.questions.some(
        (q) => q.type === "select-organ" && (!q.targetType || !q.target_id)
      )
    ) {
      toast.error(
        "Please complete target configuration for all 'Select Organ' questions."
      );
      setLoading(false);
      return;
    }
    // Add more validation as needed (e.g., at least one correct answer for MCQ)

    const payload = {
      ...quiz,
      scheduledAt: quiz.scheduledAt?.toISOString() || null,
    };

    try {
      const response = await fetch("/api/quizzes", {
        //
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create quiz.");
      }

      toast.success("Quiz created successfully!");
      setHasUnsavedChanges(false);
      // Reset form
      setQuiz({
        title: "",
        description: "",
        studyYear: undefined,
        questions: [],
        scheduledAt: undefined,
      });
      // Optional redirect to the homepage, uncomment if needed
      // router.push('/');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
        Create New Quiz
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-8">
          {" "}
          {/* LEFT COLUMN: Quiz Details */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              {" "}
              {/* */}
              <CardHeader>
                {" "}
                {/* */}
                <CardTitle>Quiz Details</CardTitle> {/* */}
              </CardHeader>
              <CardContent className="space-y-4">
                {" "}
                {/* */}
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter quiz title"
                    value={quiz.title}
                    onChange={(e) => handleQuizChange("title", e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studyYear" className="mb-2">
                    Study Year
                  </Label>
                  <Select
                    value={
                      quiz.studyYear !== undefined ? String(quiz.studyYear) : ""
                    }
                    onValueChange={handleStudyYearChange}
                  >
                    <SelectTrigger id="studyYear">
                      <SelectValue placeholder="Select study year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter quiz description (optional)"
                    value={quiz.description}
                    onChange={(e) =>
                      handleQuizChange("description", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="mb-2">
                    Schedule Date & Time (Optional)
                  </Label>
                  <DateTimePicker24h
                    date={quiz.scheduledAt}
                    setDate={(date) => handleQuizChange("scheduledAt", date)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* RIGHT COLUMN: Questions */}
          <div className="w-full md:w-2/3 space-y-6">
            <Card>
              {" "}
              {/* */}
              <CardHeader>
                {" "}
                {/* */}
                <CardTitle>Questions</CardTitle> {/* */}
              </CardHeader>
              <CardContent className="space-y-4">
                {" "}
                {/* */}
                {quiz.questions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No questions added yet. Click "Add Question" to start.
                  </p>
                )}
                {quiz.questions.map((question, qIndex) => (
                  <Card key={qIndex} className="p-4 border bg-white shadow-sm">
                    {" "}
                    {/* Nested card for each question */} {/* */}
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-lg font-semibold">
                        Question {qIndex + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveQuestion(qIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`q-text-${qIndex}`}>
                          Question Text
                        </Label>
                        <Input
                          id={`q-text-${qIndex}`}
                          type="text"
                          placeholder="Enter question text"
                          value={question.questionText}
                          onChange={(e) =>
                            handleQuestionDetailChange(
                              qIndex,
                              "questionText",
                              e.target.value
                            )
                          }
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`q-type-${qIndex}`} className="mb-2">
                          Question Type
                        </Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            handleQuestionTypeChange(qIndex, value)
                          }
                        >
                          <SelectTrigger id={`q-type-${qIndex}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple-choice">
                              Multiple Choice
                            </SelectItem>
                            <SelectItem value="true-false">
                              True/False
                            </SelectItem>
                            <SelectItem value="select-organ">
                              Select Organ
                            </SelectItem>
                            <SelectItem value="short-answer">
                              Short Answer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {question.type === "select-organ" && (
                        <div className="p-3 border rounded-md bg-slate-50 space-y-3">
                          <Label className="font-medium">
                            Target Configuration (Select Organ)
                          </Label>
                          <div>
                            <Label
                              htmlFor={`q-targetType-${qIndex}`}
                              className="mb-2"
                            >
                              Target Type
                            </Label>
                            <Select
                              value={question.targetType || ""}
                              onValueChange={(value: "mesh" | "group") => {
                                handleQuestionDetailChange(
                                  qIndex,
                                  "targetType",
                                  value
                                );
                                handleQuestionDetailChange(
                                  qIndex,
                                  "target_id",
                                  undefined
                                );
                              }}
                            >
                              <SelectTrigger id={`q-targetType-${qIndex}`}>
                                <SelectValue placeholder="Select target type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mesh">
                                  Specific Mesh
                                </SelectItem>
                                <SelectItem value="group">
                                  Organ Group
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {question.targetType === "mesh" && (
                            <div>
                              <Label>Target Mesh</Label>
                              <MeshCatalogCombobox
                                selectedMeshId={question.target_id}
                                onSelectMesh={(meshId) =>
                                  handleQuestionDetailChange(
                                    qIndex,
                                    "target_id",
                                    meshId
                                  )
                                }
                              />
                            </div>
                          )}
                          {question.targetType === "group" && (
                            <div>
                              <Label>Target Group</Label>
                              <OrganGroupCombobox
                                selectedGroupId={question.target_id}
                                onSelectGroup={(groupId) =>
                                  handleQuestionDetailChange(
                                    qIndex,
                                    "target_id",
                                    groupId
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {(question.type === "multiple-choice" ||
                        question.type === "true-false") && (
                        <div className="space-y-2 pt-2">
                          <Label className="font-medium">
                            Answers ({question.answers.length})
                          </Label>
                          {question.answers.map((answer, ansIndex) => (
                            <div
                              key={ansIndex}
                              className="flex items-center gap-2 p-2 border rounded-md bg-white"
                            >
                              <Input
                                type="radio"
                                name={`correct-answer-${qIndex}`}
                                checked={answer.isCorrect}
                                onChange={() =>
                                  handleSetCorrectAnswer(qIndex, ansIndex)
                                }
                                className="form-radio h-5 w-5 text-blue-600 cursor-pointer"
                              />
                              <Input
                                type="text"
                                placeholder={`Answer ${ansIndex + 1}`}
                                value={answer.text}
                                onChange={(e) =>
                                  handleAnswerTextChange(
                                    qIndex,
                                    ansIndex,
                                    e.target.value
                                  )
                                }
                                className="flex-1"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveAnswer(qIndex, ansIndex)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddAnswer(qIndex)}
                          >
                            Add Answer
                          </Button>
                        </div>
                      )}
                    </div>
                    {qIndex < quiz.questions.length - 1 && (
                      <Separator className="my-6" />
                    )}{" "}
                    {/* */}
                  </Card>
                ))}
                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full mt-4"
                >
                  Add Question
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-8">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? "Creating Quiz..." : "Create Quiz"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
