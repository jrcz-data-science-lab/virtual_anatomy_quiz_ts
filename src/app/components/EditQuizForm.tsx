"use client";

import { ReactEventHandler, useState } from "react";

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
}

interface EditQuizFormProps {
  id: string;
  initialTitle: string;
  initialDescription: string;
  initialQuestions: Question[];
  initialScheduledAt?: Date;
}

export default function EditQuizForm({
  id,
  initialTitle,
  initialDescription,
  initialQuestions,
  initialScheduledAt,
}: EditQuizFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState(initialQuestions);
  const [scheduledAt, setScheduledAt] = useState(initialScheduledAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question: value } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, questions, scheduledAt }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quiz");
      }

      alert("Quiz updated successfully");
    } catch (err) {
      setError("Error updating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
      </div>
      {questions.map((question, index) => (
        <div key={index} className="mb-4">
          <label
            htmlFor={`question-${index}`}
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Question {index + 1}
          </label>
          <input
            type="text"
            id={`question-${index}`}
            name={`question-${index}`}
            value={question.question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        Save
      </button>
    </form>
  );
}
