import { getQuizzes } from "../lib/getQuizzes";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

/**
 * Page component for displaying a list of planned quizzes
 *
 * Fetches the list of quizzes from the database and displays them in an unordered list.
 *
 * @returns {JSX.Element} A JSX element containing the list of planned quizzes
 */
export default async function PlannedQuizzes() {
  const quizzes = await getQuizzes();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Planned Quizzes</h1>
      <ul className="space-y-2">
        {quizzes.map((quiz) => (
          <Link
            key={quiz._id as string}
            href={`/edit/${quiz._id as string}`}
            className="p-2"
          >
            <li
              key={quiz.id}
              className="border p-3 hover:bg-gray-100 hover:shadow-md rounded-md"
            >
              {quiz.title}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
