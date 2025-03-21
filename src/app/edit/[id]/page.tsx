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
export default async function EditQuiz({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  await dbConnect();
  const { id } = await params;
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        {quiz.title} -{" "}
        {quiz.scheduledAt === null
          ? "Not Scheduled"
          : quiz.scheduledAt?.toLocaleString()}
      </h1>
      <EditQuizForm
        id={params.id}
        initialTitle={quiz.title}
        initialDescription={quiz.description}
        initialQuestions={quiz.questions}
        initialScheduledAt={quiz.scheduledAt}
      />
      {/* <form>
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
            defaultValue={quiz.title}
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
            defaultValue={quiz.description}
            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>
        {quiz.questions.map((question, index) => (
          <div key={index} className="mb-4">
            <label
              htmlFor={`question-${index}`}
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Question
            </label>
            <input
              type="text"
              id={`question-${index}`}
              name={`question-${index}`}
              defaultValue={question.question}
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </button>
      </form> */}
    </div>
  );
}
