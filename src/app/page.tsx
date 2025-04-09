import { getQuizzes } from "./lib/getQuizzes";
import QuizList from "./components/QuizList";

/**
 * The Home page component.
 *
 * This component fetches all quizzes from the database, formats the data for
 * display, and renders a list of quizzes with links to their corresponding
 * edit pages.
 *
 * @returns {JSX.Element} The rendered Home page component.
 */
export default async function Home() {
  const quizzes = (await getQuizzes()).map((quiz) => ({
    _id: String(quiz._id),
    title: quiz.title || "Untitled Quiz",
    description: quiz.description || "No description available",
    status: quiz.status || "Unknown",
    scheduledAt: quiz.scheduledAt || null,
    questions: quiz.questions.map((q: any) => ({
      ...q,
      _id: String(q._id),
      expectedOrganId: q.expectedOrganId ?? null,
      options:
        q.options?.map((opt: any) => ({
          ...opt,
          _id: String(opt._id),
        })) ?? [],
      answers:
        q.answers?.map((ans: any) => ({
          ...ans,
          _id: String(ans._id),
        })) ?? [],
    })),
  }));

  // ! Add pagination to limit the number of quizzes displayed
  // ! Add sorting options to sort quizzes by title, status, or number of questions

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Quizzes</h1>
      <QuizList quizzes={quizzes} />
    </div>
  );
}
