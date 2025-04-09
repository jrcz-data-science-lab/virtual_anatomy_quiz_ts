"use client";

import { JSX, useState } from "react";

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  type: string;
  answers: Answer[];
}

interface EditQuizFormProps {
  id: string;
  initialTitle: string;
  initialDescription: string;
  initialQuestions: Question[];
  initialScheduledAt?: Date;
}

/**
 * A form component for editing a quiz.
 *
 * The component renders a form with input fields for the quiz title, description, and questions.
 * The component also renders a button to submit the quiz. When the button is clicked, the
 * component sends a PUT request to the server with the sanitized quiz data, and alerts the
 * user whether the quiz was updated successfully or not.
 *
 * @param {{ id: string, initialTitle: string, initialDescription: string, initialQuestions: Question[], initialScheduledAt?: Date }} props - The props object containing the quiz id, title, description, questions, and scheduledAt.
 * @returns {JSX.Element} A JSX element containing the form for editing the quiz.
 */
export default function EditQuizForm({
  id,
  initialTitle,
  initialDescription,
  initialQuestions,
  initialScheduledAt,
}: EditQuizFormProps): JSX.Element {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState(initialQuestions);
  const [scheduledAt, setScheduledAt] = useState(initialScheduledAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles changes to the question input fields by updating the questions state.
   *
   * @param {number} index The index of the question that was changed.
   * @param {string} value The new value of the question input field.
   */
  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question: value } : q))
    );
  };

  /**
   * Handles changes to the answer input fields by updating the questions state.
   *
   * @param {number} questionIndex The index of the question that the answer belongs to.
   * @param {number} answerIndex The index of the answer that was changed.
   * @param {string} value The new value of the answer input field.
   */
  const handleAnswerChange = (
    questionIndex: number,
    answerIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === answerIndex ? { ...a, text: value } : a
              ),
            }
          : q
      )
    );
  };

  /**
   * Adds a new question to the quiz.
   *
   * @remarks
   * This function adds a new question to the quiz by appending a new question object
   * to the questions state. The new question object has an empty question string, no
   * type, and an empty array of answers.
   */
  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, { question: "", type: "", answers: [] }]);
  };

  /**
   * Adds a new answer to the question at the given index.
   *
   * @param {number} questionIndex The index of the question that the answer should be added to.
   *
   * @remarks
   * This function adds a new answer to the question at the given index by appending a new answer object
   * to the answers array of the question object. The new answer object has an empty text string and isCorrect set to false.
   */
  const handleAddAnswer = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              answers: [...q.answers, { text: "", isCorrect: false }],
            }
          : q
      )
    );
  };

  /**
   * Handles the submission of the quiz form by sending a PUT request to the server.
   *
   * @remarks
   * This function is called when the submit button is clicked. It prevents the default
   * form submission behavior, sets the loading state to true, and clears any error
   * messages. Then, it sends a PUT request to the server with the updated quiz data.
   * If the request is successful, it shows an alert box with a success message. If
   * the request fails, it shows an alert box with an error message. Finally, it sets
   * the loading state back to false.
   */
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
        <div key={index} className="mb-6 border border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Question {index + 1}
          </label>
          <input
            type="text"
            value={question.question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            className="mb-4 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-bold"
            placeholder="Enter question text"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-answer-${index}`}
                  checked={answer.isCorrect}
                  onChange={() => {
                    setQuestions((prev) =>
                      prev.map((q, i) =>
                        i === index
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
                  }}
                />
                <input
                  type="text"
                  value={answer.text}
                  onChange={(e) =>
                    handleAnswerChange(index, answerIndex, e.target.value)
                  }
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2"
                  placeholder={`Answer ${answerIndex + 1}`}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleAddAnswer(index)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded mt-3"
          >
            Add answer
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddQuestion}
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2"
      >
        Add question
      </button>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2"
      >
        {loading ? "Updating..." : "Update Quiz"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
