import { getQuizzes } from "./lib/getQuizzes";
import QuizList from "./components/QuizList";
import { IQuiz, IQuestion } from "./models/Quiz";

type QuizListQuiz = {
  _id: string;
  title: string;
  description: string;
  questions: {
    question: string;
    type: string;
  }[];
  scheduledAt: string | null;
};

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
  const quizzes = await getQuizzes();
  const quizzesForClient: QuizListQuiz[] = quizzes.map((quiz) => {
    return {
      _id: (quiz._id as { toString: () => string }).toString(), // Convert ObjectId to string
      title: quiz.title || "Untitled Quiz",
      description: quiz.description || "No description available",

      // Convert Date to ISO string or null
      scheduledAt: quiz.scheduledAt
        ? new Date(quiz.scheduledAt).toISOString()
        : null,

      questions: quiz.questions.map((q: IQuestion) => {
        // q is a question subdocument from the lean quiz object.
        // It contains all fields from your IQuestion model, including _id, questionText, type,
        // answers, targetType, target_id.
        // We must ensure EVERYTHING passed to the client component is plain.

        // Map to the simpler structure expected by QuizList, ensuring all parts are plain.
        return {
          _id: q._id ? q._id.toString() : undefined, // Convert question's _id
          question: q.questionText || "", // Map from questionText to question
          type: q.type,
          // IMPORTANT: Do not spread `...q` here if q contains non-plain objects like
          // q.answers (which could have ObjectIds for their _id) or q.target_id (ObjectId).
          // The QuizList's `questions` type is very simple: { question: string; type: string }[]
          // It doesn't use answers, targetType, target_id.
        };
      }),
    };
  });

  // ! Add pagination to limit the number of quizzes displayed
  // ! Add filtering options to sort quizzes by title, status, or number of questions

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Quizzes</h1>
      <QuizList quizzes={quizzesForClient} />
    </div>
  );
}
