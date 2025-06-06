"use client";

import { useEffect, useState, useMemo, JSX } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// Simplified type for quizzes fetched for the calendar
interface CalendarQuiz {
  _id: string;
  title: string;
  scheduledAt: string; // ISO string
}

/**
 * Page component for rendering a calendar of planned quizzes for the current month.
 *
 * This component fetches quizzes for the current month, groups them by date, and
 * renders a calendar with links to edit each quiz. The component also handles
 * month navigation.
 *
 * @returns {JSX.Element} A JSX element containing a calendar with links to edit each quiz.
 */
export default function PlannedQuizzesCalendarPage(): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [quizzes, setQuizzes] = useState<CalendarQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch quizzes whenever the current month changes
  useEffect(() => {
    const fetchQuizzesForMonth = async () => {
      setLoading(true);
      const monthQuery = format(currentMonth, "yyyy-MM");
      try {
        const response = await fetch(`/api/quizzes?month=${monthQuery}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();
        // Ensure data is properly serialized for client-side use
        const serializedQuizzes = data.map((quiz: any) => ({
          _id: quiz._id.toString(),
          title: quiz.title,
          scheduledAt: new Date(quiz.scheduledAt).toISOString(),
        }));
        setQuizzes(serializedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setQuizzes([]); // Clear quizzes on error
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzesForMonth();
  }, [currentMonth]);

  // Group quizzes by date for easy rendering
  const quizzesByDate = useMemo(() => {
    const grouped = new Map<string, CalendarQuiz[]>();
    quizzes.forEach((quiz) => {
      const dateKey = format(new Date(quiz.scheduledAt), "yyyy-MM-dd");
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(quiz);
    });
    return grouped;
  }, [quizzes]);

  // Custom component to render the content of each calendar day
  const CustomDayContent = ({ date }: { date: Date }) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayQuizzes = quizzesByDate.get(dateKey);

    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex justify-end">
          <time dateTime={dateKey} className="text-xs">
            {format(date, "d")}
          </time>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
          {dayQuizzes?.map((quiz) => (
            <Link
              key={quiz._id}
              href={`/edit/${quiz._id}`}
              className="block text-left text-xs bg-blue-600 text-white rounded px-2 py-1 truncate hover:bg-blue-700 transition-colors max-w-[90%] ml-1"
            >
              {quiz.title}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{format(currentMonth, "MMMM y")}</h1>
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
      </div>
      <Calendar
        weekStartsOn={1}
        mode="single" // Using single mode to render a full month
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        formatters={{
          // This is a workaround to hide the default day number, since we are rendering it in CustomDayContent
          formatDay: () => "",
        }}
        className="p-0"
        classNames={{
          months: "w-full",
          month: "w-full space-y-4 border rounded-lg p-3",
          table: "w-full border-collapse",
          head_row: "flex border-b border-blue-600",
          head_cell:
            "flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] flex justify-center items-center",
          row: "flex w-full mt-2",
          cell: "h-28 flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md rounded-md border m-1 max-w-[200px]",
          day: "h-full w-full justify-start items-start p-1",
        }}
        components={{
          DayContent: CustomDayContent,
        }}
      />
    </div>
  );
}
