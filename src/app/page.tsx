// import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { getQuizzes } from "./lib/getQuizzes";
import Link from "next/link";

/**
 * The main page of the app, which displays a list of quizzes.
 *
 * When the page is loaded, it fetches the list of quizzes from the database and
 * displays them in a grid. Each quiz is displayed as a card with a title,
 * status, and number of questions. The user can click on a quiz card to go to
 * the edit page for that quiz.
 */
export default async function Home() {
  const quizzes = await getQuizzes();

  // ! Add search bar to filter quizzes by title
  // ! Add pagination to limit the number of quizzes displayed
  // ! Add sorting options to sort quizzes by title, status, or number of questions

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Quizzes</h1>
      {quizzes.length === 0 ? (
        <p>No quizzes found</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {quizzes.map((quiz) => (
            <Link key={quiz._id as string} href={`/edit/${quiz._id as string}`}>
              <Card
                key={quiz.id}
                className="h-full hover:shadow-lg hover:bg-gray-100 cursor-pointer"
              >
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="pb-2">{quiz.description}</p>
                  <p>Status: {quiz.status}</p>
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
