"use client";

import { JSX, useState } from "react";
// import RootLayout from "../layout";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

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
  const [quiz, setQuiz] = useState<{
    title: string;
    description: string;
    questions: {
      question: string;
      type: string;
      options: string[];
      correctAnswer: string;
    }[];
  }>({ title: "", description: "", questions: [] });

  const [questionType, setQuestionType] = useState<string>("");

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
          options: [],
          correctAnswer: "",
        },
      ],
    }));
  };

  /**
   * Handles the submission of the quiz form.
   *
   * The function first filters out any questions with empty question text, and
   * if there are any empty questions, it alerts the user and does not submit the
   * quiz.
   *
   * Otherwise, it sends a POST request to the server with the sanitized quiz
   * data, and alerts the user whether the quiz was created successfully or not.
   */
  const handleSubmit = async () => {
    const validQuestions = quiz.questions.filter(
      (q) => q.question.trim() !== ""
    );

    if (validQuestions.length !== quiz.questions.length) {
      alert("Please fill out all questions before submitting the quiz.");
      return;
    }

    const sanitizedQuiz = {
      ...quiz,
      questions: validQuestions,
    };

    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedQuiz),
    });
    if (response.ok) {
      alert("Quiz created successfully!");
    } else {
      alert("Failed to create quiz.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Create a Quiz</h1>
      <input
        type="text"
        placeholder="Title"
        value={quiz.title}
        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        className="mt-4 mb-2 block w-full p-2 border border-gray-300 rounded"
      />
      <textarea
        placeholder="Description"
        value={quiz.description}
        onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
        className="mt-2 mb-4 block w-full p-2 border border-gray-300 rounded"
      />

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded"
        onClick={handleAddQuestion}
      >
        Add Question
      </button>

      {quiz.questions.map((question, index) => (
        <div key={index}>
          <input
            className="mt-4 mb-2 block w-full p-2 border border-gray-300 rounded"
            type="text"
            placeholder="Question"
            value={question.question}
            onChange={(e) =>
              setQuiz((prev) => {
                const newQuestions = [...prev.questions];
                newQuestions[index].question = e.target.value;
                return { ...prev, questions: newQuestions };
              })
            }
          />
          <FormControl className="mt-2 mb-2 block w-full">
            <InputLabel id={`question-type-label-${index}`}>
              Question Type
            </InputLabel>
            <Select
              labelId="question-type-label"
              id={`question-type-${index}`}
              value={questionType || question.type}
              onChange={(event) => {
                const newQuestions = [...quiz.questions];
                newQuestions[index].type = event.target.value;
                setQuiz((prev) => ({ ...prev, questions: newQuestions }));
              }}
              autoWidth
              label="Question Type"
            >
              <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
              <MenuItem value="true-false">True/False</MenuItem>
              <MenuItem value="select-organ">Select Organ</MenuItem>
              <MenuItem value="short-answer">Short Answer</MenuItem>
            </Select>
          </FormControl>
        </div>
      ))}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-2 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
