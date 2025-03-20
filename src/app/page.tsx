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

  return (
    <div>
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
                  <p>Status : {quiz.status}</p>
                  <p>Questions : {quiz.questions.length}</p>
                  {/* Add planned date later */}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
