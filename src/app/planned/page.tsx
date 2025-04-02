import { getQuizzes } from "../lib/getQuizzes";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

/**
 * Page component for displaying planned quizzes.
 *
 * The component fetches all quizzes from the database and then filters them to show only those that have a scheduled date in the future. The quizzes are then displayed in a list with links to their corresponding edit pages.
 *
 * @returns {JSX.Element} A JSX element containing the list of planned quizzes.
 */
export default async function PlannedQuizzes() {
  const quizzes = await getQuizzes();

  const filteredQuizzes = quizzes.filter((quiz) => {
    const scheduledAt = quiz.scheduledAt as Date | null;
    return scheduledAt !== null && scheduledAt > new Date();
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Planned Quizzes</h1>
      {filteredQuizzes.length === 0 ? (
        <p>No planned quizzes found</p>
      ) : (
        <ul className="space-y-2">
          {filteredQuizzes.map((quiz) => (
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
      )}
    </div>
  );
}
