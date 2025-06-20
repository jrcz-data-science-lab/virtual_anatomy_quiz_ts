"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Simplified Quiz type for this listing page
interface ListedQuiz {
  _id: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: string; // Or Date
  // Add any other fields you want to display in the list
}

export default function SelectQuizForResultsPage() {
  const [quizzes, setQuizzes] = useState<ListedQuiz[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/quizzes");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch quizzes: ${response.statusText}`
          );
        }
        const data = await response.json();
        // Map the fetched data to the ListedQuiz interface
        const formattedQuizzes: ListedQuiz[] = data.map((quiz: any) => ({
          _id: quiz._id,
          title: quiz.title || "Untitled Quiz",
          description: quiz.description || "No description available.",
          questionCount: quiz.questions?.length || 0,
          createdAt: quiz.createdAt,
        }));
        setQuizzes(formattedQuizzes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuizSelect = (quizId: string) => {
    router.push(`/results/${quizId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading quizzes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">View Quiz Results</h1>
        <p className="text-gray-600">
          Select a quiz from the list below to see its detailed results and
          charts.
        </p>
      </header>

      <Input
        type="text"
        placeholder="Search quizzes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 mb-6 w-full max-w-md"
      />

      {filteredQuizzes.length === 0 ? (
        <p className="text-center text-gray-500">
          No quizzes found{searchTerm && " matching your search"} .
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz._id}
              className="h-full hover:shadow-lg cursor-pointer transition-shadow duration-200"
              onClick={() => handleQuizSelect(quiz._id)}
            >
              {" "}
              <CardHeader>
                {" "}
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {" "}
                <p className="text-md text-gray-600 mb-2 line-clamp-3">
                  {quiz.description}
                </p>
                <CardDescription className="text-sm text-gray-500">
                  {" "}
                  Questions: {quiz.questionCount} <br />
                  Created:{" "}
                  {new Date(quiz.createdAt).toLocaleDateString("nl-NL", {
                    hour12: false,
                  })}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
