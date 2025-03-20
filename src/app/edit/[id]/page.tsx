import { getQuizzes } from "@/app/lib/getQuizzes";
import dbConnect from "@/app/lib/dbConnect";
import Quiz from "@/app/models/Quiz";

/**
 * Page component for editing a quiz
 *
 * @param {{ params: { id: string } }} props - The props object containing the quiz id
 * @returns {JSX.Element} A JSX element containing the form for editing the quiz
 */
export default async function EditQuiz({ params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = await params;
  const quiz = await Quiz.findById(id).lean<{
    title: string;
    description: string;
  }>();

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Edit Quiz</h1>
      <form>
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
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </button>
        {/* Make every question editable */}
        {/* Add a button to add a new question */}
      </form>
    </div>
  );
}
