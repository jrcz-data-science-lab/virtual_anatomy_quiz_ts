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

interface EditQuestionProps {
  index: number;
  question: Question;
  onChangeQuestion: (index: number, newText: string) => void;
  onChangeAnswer: (
    questionIndex: number,
    answerIndex: number,
    newText: string
  ) => void;
  onSetCorrect: (questionIndex: number, answerIndex: number) => void;
  onAddAnswer: (questionIndex: number) => void;
}

/**
 * A component for editing a single question.
 *
 * @param {{ index: number, question: Question, onChangeQuestion: (index: number, newText: string) => void, onChangeAnswer: (questionIndex: number, answerIndex: number, newText: string) => void, onSetCorrect: (questionIndex: number, answerIndex: number) => void, onAddAnswer: (questionIndex: number) => void }} props
 * @returns {JSX.Element}
 */
export default function EditQuestionBox({
  index,
  question,
  onChangeQuestion,
  onChangeAnswer,
  onSetCorrect,
  onAddAnswer,
}: EditQuestionProps): JSX.Element {
  return (
    <div className="mb-6 border border-gray-300 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Question {index + 1}
      </label>
      <input
        type="text"
        value={question.question}
        onChange={(e) => onChangeQuestion(index, e.target.value)}
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
              onChange={() => onSetCorrect(index, answerIndex)}
            />
            <input
              type="text"
              value={answer.text}
              onChange={(e) =>
                onChangeAnswer(index, answerIndex, e.target.value)
              }
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2"
              placeholder={`Answer ${answerIndex + 1}`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddAnswer(index)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded mt-4"
      >
        Add answer
      </button>
    </div>
  );
}
