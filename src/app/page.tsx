import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { getQuizzes } from "./lib/getQuizzes";

export default async function Home() {
  const quizzes = await getQuizzes();

  return (
    <div>
      <h1 className="text-3xl font-bold">Quizzes</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="h-full">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status : {quiz.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
