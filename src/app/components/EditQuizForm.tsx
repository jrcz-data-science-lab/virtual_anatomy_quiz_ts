"use client";

import { JSX, useState, useEffect } from "react";
import EditQuestionBox from "./EditQuestionBox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { FrontendQuestion, FrontendAnswer } from "../lib/types";
import { DateTimePicker24h } from "./DateTimePicker";
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

interface EditQuizFormProps {
  id: string;
  initialTitle: string;
  initialDescription: string;
  initialStudyYear: number;
  initialQuestions: FrontendQuestion[];
  initialScheduledAt?: Date | string; // Allow string for initial fetch
}

/**
 * A form component for editing a quiz.
 *
 * The form component renders a series of input fields and other components to edit the
 * quiz title, description, study year, questions, and scheduled date and time.
 *
 * The component also renders a button to add a new question, and a button to delete the
 * quiz.
 *
 * The component accepts the following props:
 *
 * - `id`: The ID of the quiz to be edited.
 * - `initialTitle`: The initial title of the quiz.
 * - `initialDescription`: The initial description of the quiz.
 * - `initialStudyYear`: The initial study year of the quiz.
 * - `initialQuestions`: The initial questions of the quiz.
 * - `initialScheduledAt`: The initial scheduled date and time of the quiz.
 *
 * The component returns a JSX element containing the form.
 */
export default function EditQuizForm({
  id,
  initialTitle,
  initialDescription,
  initialStudyYear,
  initialQuestions,
  initialScheduledAt,
}: EditQuizFormProps): JSX.Element {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [studyYear, setStudyYear] = useState<number | undefined>(
    initialStudyYear
  );
  const [questions, setQuestions] = useState<FrontendQuestion[]>(
    // Ensure initial questions have all fields, even if undefined
    initialQuestions.map((q) => ({
      ...q,
      questionText: q.questionText || (q as any).question || "",
      answers: q.answers || [],
      targetType: q.targetType || undefined,
      target_id: q.target_id || undefined,
    }))
  );
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    initialScheduledAt ? new Date(initialScheduledAt) : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handler for question text
  const handleQuestionTextChange = (index: number, newText: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, questionText: newText } : q))
    );
  };

  // Handler for question type
  const handleQuestionTypeChange = (index: number, newType: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? {
              ...q,
              type: newType,
              // Reset target fields if type is not select-organ
              targetType: newType === "select-organ" ? q.targetType : undefined,
              target_id: newType === "select-organ" ? q.target_id : undefined,
              // Reset answers if type changes to something that doesn't use them or uses them differently
              answers:
                newType === "multiple-choice" || newType === "true-false"
                  ? q.answers
                  : [],
            }
          : q
      )
    );
  };

  // Handler for answer text
  const handleAnswerTextChange = (
    questionIndex: number,
    answerIndex: number,
    newText: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === answerIndex ? { ...a, text: newText } : a
              ),
            }
          : q
      )
    );
  };

  // Handler for setting correct answer
  const handleSetCorrectAnswer = (
    questionIndex: number,
    answerIndex: number
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) => ({
                ...a,
                isCorrect: j === answerIndex,
              })),
            }
          : q
      )
    );
  };

  // Handler for adding an answer
  const handleAddAnswer = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: [
                ...(q.answers || []),
                { text: "", isCorrect: false, _id: `new_${Date.now()}` },
              ],
            }
          : q
      )
    );
  };

  // Handler for removing an answer
  const handleRemoveAnswer = (questionIndex: number, answerIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, answers: q.answers.filter((_, j) => j !== answerIndex) }
          : q
      )
    );
  };

  // Handler for adding a question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        _id: `new_q_${Date.now()}`, // Temporary client-side key/ID
        questionText: "",
        type: "multiple-choice", // Default type
        answers: [],
        targetType: undefined,
        target_id: undefined,
      },
    ]);
  };

  // Handler for removing a question
  const handleRemoveQuestion = (questionIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== questionIndex));
  };

  // Handler for target type
  const handleChangeTargetType = (
    questionIndex: number,
    targetType: "mesh" | "group" | undefined
  ) => {
    setQuestions(
      (prev) =>
        prev.map((q, i) =>
          i === questionIndex
            ? { ...q, targetType: targetType, target_id: undefined }
            : q
        ) // Reset target_id when type changes
    );
  };

  // Handler for target ID
  const handleChangeTargetId = (
    questionIndex: number,
    targetId: string | undefined
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...q, target_id: targetId } : q
      )
    );
  };

  /**
   * Handles form submission by sending a PUT request to the server
   * with the updated quiz data. If the request is successful, it
   * displays a success toast message. If the request fails, it
   * displays an error toast message and sets the error state.
   * @param {React.FormEvent} e The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (studyYear === undefined) {
      setError("Study year is required.");
      setLoading(false);
      toast.error("Study year is required.");
      return;
    }

    // Prepare questions for submission, ensuring _id is handled correctly
    const questionsToSubmit = questions.map((q) => {
      const { _id, ...questionData } = q; // Separate client-side _id
      return {
        ...(q._id && !q._id.startsWith("new_") ? { _id: q._id } : {}), // Keep existing DB _id
        ...questionData,
        answers: q.answers.map((a) => {
          const { _id: ansId, ...answerData } = a;
          return {
            ...(a._id && !a._id.startsWith("new_") ? { _id: a._id } : {}),
            ...answerData,
          };
        }),
      };
    });

    try {
      const payload = {
        title,
        description,
        studyYear,
        questions: questionsToSubmit,
        scheduledAt: scheduledAt?.toISOString() || null,
      };
      const response = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update quiz");
      }
      toast.success("Quiz updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating quiz");
      toast.error(err instanceof Error ? err.message : "Error updating quiz");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles deleting a quiz by sending a DELETE request to the server
   * with the quiz ID. If the request is successful, it displays a success
   * toast message and navigates to the home page. If the request fails, it
   * displays an error toast message and sets the error state.
   */
  const handleDeleteQuiz = async () => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      setLoading(true);
      try {
        const response = await fetch(`/api/quizzes/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete quiz");
        toast.success("Quiz deleted successfully");
        router.push("/"); // Navigate to home
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error deleting quiz");
        toast.error(err instanceof Error ? err.message : "Error deleting quiz");
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="studyYear" className="mb-2">
            Study Year
          </Label>
          <Select
            value={studyYear !== undefined ? String(studyYear) : ""}
            onValueChange={(value) =>
              setStudyYear(value ? parseInt(value) : undefined)
            }
            required
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
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="mb-2">Date and Time to be Scheduled</Label>
        <DateTimePicker24h date={scheduledAt} setDate={setScheduledAt} />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Questions</h3>
        {questions.map((question, index) => (
          <EditQuestionBox
            key={question._id || `q-${index}`} // Use existing _id or temporary key
            index={index}
            question={question}
            onChangeQuestionText={handleQuestionTextChange}
            onChangeQuestionType={handleQuestionTypeChange}
            onChangeAnswerText={handleAnswerTextChange}
            onSetCorrectAnswer={handleSetCorrectAnswer}
            onAddAnswer={handleAddAnswer}
            onRemoveAnswer={handleRemoveAnswer}
            onRemoveQuestion={handleRemoveQuestion}
            onChangeTargetType={handleChangeTargetType}
            onChangeTargetId={handleChangeTargetId}
          />
        ))}
        <Button type="button" onClick={handleAddQuestion} variant="outline">
          Add Question
        </Button>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteQuiz}
          disabled={loading}
        >
          Delete Quiz
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Quiz"}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </form>
  );
}
