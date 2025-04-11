"use client";

import { JSX, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { MenuItem } from "@mui/material";
import { Separator } from "@/components/ui/separator";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { DateTimePicker24h } from "../components/DateTimePicker";
import { toast } from "sonner";
import { useWarnIfUnsavedChanges } from "@/app/lib/warnIfUnsavedChanges";

/**
 * A form component for creating a quiz.
 *
 * The component renders a form with input fields for the quiz title and
 * description, as well as a list of questions. Each question has input fields
 * for the question text, type, options, and correct answer. The component also
 * renders a button to add a new question, and a button to submit the quiz.
 *
 * When the submit button is clicked, the component filters out any questions
 * with empty question text, and if there are any empty questions, it alerts the
 * user and does not submit the quiz. Otherwise, it sends a POST request to the
 * server with the sanitized quiz data, and alerts the user whether the quiz was
 * created successfully or not.
 */
export default function CreateQuiz(): JSX.Element {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [quiz, setQuiz] = useState<{
    title: string;
    description: string;
    questions: {
      question: string;
      type: string;
      answers?: {
        text: string;
        isCorrect: boolean;
      }[];
      expectedOrganId?: string;
    }[];
    scheduledAt?: Date | undefined;
  }>({ title: "", description: "", questions: [], scheduledAt: undefined });

  const [questionType, setQuestionType] = useState<string>("");

  useWarnIfUnsavedChanges(hasUnsavedChanges);

  const handleQuestionTypeChange = (event: SelectChangeEvent) => {
    setQuestionType(event.target.value);
  };

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          type: "",
          answers: [],
          expectedOrganId: "", // optional 😛
        },
      ],
    }));
  };

  /**
   * Handles the submission of the quiz form.
   *
   * When the submit button is clicked, this function is called. It first filters
   * out any questions with empty question text, and if there are any empty
   * questions, it alerts the user and does not submit the quiz. Otherwise, it
   * sends a POST request to the server with the sanitized quiz data, and alerts
   * the user whether the quiz was created successfully or not.
   */
  const handleSubmit = async () => {
    const validQuestions = quiz.questions.filter(
      (q) => q.question.trim() !== ""
    );

    if (validQuestions.length !== quiz.questions.length) {
      toast("Please fill out all questions before submitting the quiz.");
      return;
    }

    const sanitizedQuiz = {
      ...quiz,
      questions: validQuestions,
      scheduledAt: quiz.scheduledAt?.toISOString() || null,
    };

    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedQuiz),
    });
    if (response.ok) {
      toast("Quiz created successfully!");
      // Reset the form after successful submission
      setQuiz({
        title: "",
        description: "",
        questions: [],
        scheduledAt: undefined,
      });
    } else {
      toast("Failed to create quiz.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Create a Quiz</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={quiz.title}
            onChange={(e) => {
              setHasUnsavedChanges(true);
              setQuiz({ ...quiz, title: e.target.value });
            }}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <textarea
            placeholder="Description"
            value={quiz.description}
            onChange={(e) => {
              setHasUnsavedChanges(true);
              setQuiz({ ...quiz, description: e.target.value });
            }}
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
          />
          <DateTimePicker24h
            date={quiz.scheduledAt}
            setDate={(date) => setQuiz({ ...quiz, scheduledAt: date })}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 space-y-4">
          {quiz.questions.map((question, index) => (
            <div key={index}>
              <input
                className="w-full p-2 border border-gray-300 rounded mb-4"
                type="text"
                placeholder="Question"
                value={question.question}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  setQuiz((prev) => {
                    const newQuestions = [...prev.questions];
                    newQuestions[index].question = e.target.value;
                    return { ...prev, questions: newQuestions };
                  });
                }}
              />
              <FormControl fullWidth className="mt-2">
                <InputLabel id={`question-type-label-${index}`}>
                  Question Type
                </InputLabel>
                <Select
                  labelId={`question-type-label-${index}`}
                  id={`question-type-${index}`}
                  value={questionType || question.type}
                  onChange={(event) => {
                    setHasUnsavedChanges(true);
                    const newQuestions = [...quiz.questions];
                    newQuestions[index].type = event.target.value;
                    setQuiz((prev) => ({ ...prev, questions: newQuestions }));
                  }}
                  label="Question Type"
                >
                  <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                  <MenuItem value="true-false">True/False</MenuItem>
                  <MenuItem value="select-organ">Select Organ</MenuItem>
                  <MenuItem value="short-answer">Short Answer</MenuItem>
                </Select>
              </FormControl>
              {question.type === "multiple-choice" ||
              question.type === "true-false" ? (
                <>
                  {question.answers?.map((answer, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2 my-2">
                      <input
                        type="text"
                        placeholder={`Answer ${aIdx + 1}`}
                        value={answer.text}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          const newQuestions = [...quiz.questions];
                          newQuestions[index].answers![aIdx].text =
                            e.target.value;
                          setQuiz((prev) => ({
                            ...prev,
                            questions: newQuestions,
                          }));
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded"
                      />
                      <label>
                        Correct:
                        <input
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={(e) => {
                            setHasUnsavedChanges(true);
                            const newQuestions = [...quiz.questions];
                            newQuestions[index].answers![aIdx].isCorrect =
                              e.target.checked;
                            setQuiz((prev) => ({
                              ...prev,
                              questions: newQuestions,
                            }));
                          }}
                          className="ml-2"
                        />
                      </label>
                    </div>
                  ))}
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-2"
                    onClick={() => {
                      const newQuestions = [...quiz.questions];
                      newQuestions[index].answers!.push({
                        text: "",
                        isCorrect: false,
                      });
                      setQuiz((prev) => ({ ...prev, questions: newQuestions }));
                    }}
                  >
                    + Add Answer
                  </button>
                </>
              ) : null}
              <Separator className="my-4" />
            </div>
          ))}

          <div className="flex gap-2 justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              onClick={handleAddQuestion}
            >
              Add Question
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
