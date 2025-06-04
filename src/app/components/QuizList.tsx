"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Quiz = {
  _id: string;
  title: string;
  description: string;
  questions: { question: string; type: string }[];
  scheduledAt: Date | string | null;
};

/**
 * A component for displaying a list of quizzes. The component renders a search
 * bar and a grid of cards, each representing a quiz. The component filters the
 * list of quizzes based on the search term, and renders the following information
 * for each quiz: title, description, status, number of questions, and scheduled
 * date.
 *
 * @param {{ quizzes: Quiz[] }} props - The props object containing the list of
 * quizzes.
 * @returns {JSX.Element} A JSX element containing the list of quizzes.
 */
export default function QuizList({
  quizzes,
}: {
  quizzes: Quiz[];
}): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search quizzes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 my-4 w-full"
      />

      {filteredQuizzes.length === 0 ? (
        <p>No quizzes found</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <Link key={quiz._id} href={`/edit/${quiz._id}`}>
              <Card className="h-full hover:shadow-lg hover:bg-gray-100 cursor-pointer">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="pb-2">{quiz.description}</p>
                  <p>Questions: {quiz.questions.length}</p>
                  <p>
                    Scheduled For:{" "}
                    {quiz.scheduledAt === null
                      ? "Not Scheduled"
                      : new Date(quiz.scheduledAt).toLocaleString("nl-NL", {
                          hour12: false,
                        })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
