"use client";

import { JSX, useState } from "react";
import RootLayout from "../layout";

/**
 * A Next.js page component that allows users to create a new quiz.
 *
 * The component renders a form with input fields for the quiz title, description, and questions.
 * Each question has an input field for the question text and an "Add Question" button to add a new
 * question to the quiz.
 * The form also has a "Submit" button to submit the quiz to the server.
 *
 * The component uses the useState hook to store the quiz data in the component's state.
 * The data is initialized with empty strings for the title and description, and an empty array
 * for the questions.
 *
 * The component also uses the useEffect hook to fetch the quiz data from the server when the
 * component mounts.
 * The fetched data is stored in the component's state and used to initialize the form fields.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function CreateQuiz(): JSX.Element {
  const [quiz, setQuiz] = useState<{
    title: string;
    description: string;
    questions: {
      text: string;
      type: string;
      options: string[];
      correctAnswer: string;
    }[];
  }>({ title: "", description: "", questions: [] });

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: "", type: "multiple-choice", options: [], correctAnswer: "" },
      ],
    }));
  };

  const handleSubmit = async () => {
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quiz),
    });
    if (response.ok) {
      alert("Quiz created successfully!");
    }
  };

  return (
    <RootLayout>
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
        {quiz.questions.map((question, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Question"
              value={question.text}
              onChange={(e) =>
                setQuiz((prev) => {
                  const newQuestions = [...prev.questions];
                  newQuestions[index].text = e.target.value;
                  return { ...prev, questions: newQuestions };
                })
              }
            />
            <button onClick={handleAddQuestion}>Add Question</button>
          </div>
        ))}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </RootLayout>
  );
}
