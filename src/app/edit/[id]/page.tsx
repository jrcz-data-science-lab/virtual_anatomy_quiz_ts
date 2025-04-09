import { getQuizzes } from "@/app/lib/getQuizzes";
import EditQuizForm from "@/app/components/EditQuizForm";
import dbConnect from "@/app/lib/dbConnect";
import Quiz from "@/app/models/Quiz";
import { JSX } from "react";

/**
 * Page component for editing a quiz
 *
 * @param {{ params: { id: string } }} props - The props object containing the quiz id
 * @returns {JSX.Element} A JSX element containing the form for editing the quiz
 */
export default async function EditQuiz(props: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const params = await props.params;
  await dbConnect();
  const id = params.id;
  const quiz = await Quiz.findById(id).lean<{
    title: string;
    description: string;
    questions: Array<{
      question: string;
      type: string;
      options?: string[];
      correctAnswer?: string;
    }>;
    scheduledAt?: Date;
  }>();

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  const plainQuiz = JSON.parse(JSON.stringify(quiz));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        {plainQuiz.title} -{" "}
        {quiz.scheduledAt === null
          ? "Not Scheduled"
          : quiz.scheduledAt?.toLocaleString()}
      </h1>
      <EditQuizForm
        id={params.id}
        initialTitle={plainQuiz.title}
        initialDescription={plainQuiz.description}
        initialQuestions={plainQuiz.questions}
        initialScheduledAt={plainQuiz.scheduledAt}
      />
    </div>
  );
}
