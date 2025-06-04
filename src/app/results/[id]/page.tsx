"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { IQuestion } from "@/app/models/Quiz";

// Interfaces to match the API response structure
interface AnswerBreakdown {
  answerText: string;
  studentCount: number;
  isCorrectOption?: boolean;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: IQuestion["type"];
  totalSubmissionsForQuestion: number;
  totalCorrect: number;
  answersBreakdown: AnswerBreakdown[];
  submittedTextAnswers?: string[];
  correctOrganDisplayName?: string;
}

// Chart component (can be in the same file or a separate one)
interface QuestionChartProps {
  data: AnswerBreakdown[];
  questionType: IQuestion["type"];
}

const QuestionChart: React.FC<QuestionChartProps> = ({
  data,
  questionType,
}) => {
  // Define colors for correct and incorrect answers
  const CORRECT_COLOR = "#82ca9d"; // Greenish
  const INCORRECT_COLOR = "#fa8072"; // Salmon/Reddish
  const NEUTRAL_COLOR = "#8884d8"; // Default Recharts purple

  // Determine if we should color based on correctness
  // Only color if isCorrectOption is present for all data points or for specific types
  const canColorByCorrectness = data.every(
    (item) => typeof item.isCorrectOption === "boolean"
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 50,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="answerText"
          angle={
            questionType === "short-answer" ||
            data.some((d) => d.answerText.length > 15)
              ? -45
              : 0
          } // Angle labels if text is long
          textAnchor={
            questionType === "short-answer" ||
            data.some((d) => d.answerText.length > 15)
              ? "end"
              : "middle"
          }
          interval={0} // Show all labels
          height={70} // Adjust height for angled labels
        />
        <YAxis
          allowDecimals={false}
          label={{
            value: "Number of Students",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value, name, props) => {
            const payload = props.payload as AnswerBreakdown;
            let tooltipLabel = `${value} student(s)`;
            if (payload.isCorrectOption === true) {
              tooltipLabel += " (Correct)";
            } else if (payload.isCorrectOption === false) {
              tooltipLabel += " (Incorrect)";
            }
            return [tooltipLabel, "Students"];
          }}
        />
        <Bar dataKey="studentCount" name="Students">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                canColorByCorrectness && entry.isCorrectOption === true
                  ? CORRECT_COLOR
                  : canColorByCorrectness && entry.isCorrectOption === false
                  ? INCORRECT_COLOR
                  : NEUTRAL_COLOR
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface ShortAnswerDisplayProps {
  responses: string[];
}

const ShortAnswerDisplay: React.FC<ShortAnswerDisplayProps> = ({
  responses,
}) => {
  if (!responses || responses.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No short answers submitted for this question.
      </p>
    );
  }
  return (
    <div>
      <h4 className="text-md font-semibold mb-2">Submitted Answers:</h4>
      <ScrollArea className="h-[200px] w-full rounded-md border p-3">
        {" "}
        {/* */}
        <ul className="space-y-2">
          {responses.map((response, index) => (
            <li key={index} className="text-sm p-2 bg-gray-50 rounded">
              {response}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      const fetchResults = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/quizzes/${quizId}/results`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                `Failed to fetch results: ${response.statusText}`
            );
          }
          const data: QuestionResult[] = await response.json();
          setResults(data);
          // Assuming the first question's quiz data might indirectly give a title,
          // or you might fetch quiz details separately if needed for the title.
          // For simplicity, we'll try to get a hint from the first question or set a generic one.
          if (data.length > 0) {
            // This is a placeholder. Ideally, fetch quiz details separately for its title.
            // For now, we don't have the quiz title directly in QuestionResult.
            // setQuizTitle(data[0].quizTitle || `Results for Quiz`); // quizTitle not in QuestionResult
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        No results found for this quiz, or no questions in the quiz.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Quiz Results</h1>
      {results.map((questionResult) => (
        <Card key={questionResult.questionId} className="overflow-hidden">
          {" "}
          {/* */}
          <CardHeader>
            {" "}
            {/* */}
            <CardTitle>{questionResult.questionText}</CardTitle> {/* */}
            <CardDescription className="text-sm text-gray-600">
              {" "}
              {/* */}
              Type: {questionResult.questionType} <br />
              Total Submissions for this Question:{" "}
              {questionResult.totalSubmissionsForQuestion}
              {questionResult.questionType !== "short-answer" &&
                typeof questionResult.totalCorrect === "number" && (
                  <>
                    <br />
                    Total Correct Answers: {questionResult.totalCorrect} (
                    {questionResult.totalSubmissionsForQuestion > 0
                      ? (
                          (questionResult.totalCorrect /
                            questionResult.totalSubmissionsForQuestion) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </>
                )}
              {questionResult.questionType === "select-organ" &&
                questionResult.correctOrganDisplayName && (
                  <>
                    {" "}
                    <br /> Correct Organ:{" "}
                    {questionResult.correctOrganDisplayName}{" "}
                  </>
                )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {" "}
            {/* */}
            {questionResult.questionType === "short-answer" ? (
              <ShortAnswerDisplay
                responses={questionResult.submittedTextAnswers || []}
              />
            ) : questionResult.answersBreakdown &&
              questionResult.answersBreakdown.length > 0 ? (
              <QuestionChart
                data={questionResult.answersBreakdown}
                questionType={questionResult.questionType}
              />
            ) : (
              <p>No submissions provided data for this question's chart.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
