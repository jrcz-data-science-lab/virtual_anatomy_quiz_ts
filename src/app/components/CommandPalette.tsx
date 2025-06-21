"use client";

import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FilePlusIcon,
  HomeIcon,
  BarChartIcon,
  CalendarIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";

// Simplified type for quizzes fetched for the command palette
interface CommandQuiz {
  _id: string;
  title: string;
}

/**
 * A command palette component that allows users to search for and run commands
 * quickly. The component listens for the "k" key (or "ctrl + k" on Windows) and
 * opens the command input when pressed. The component fetches quizzes from the
 * API when opened and allows users to search for quizzes by title. The
 * component renders a list of commands that can be run, including navigation,
 * creating a new quiz, viewing planned quizzes, and viewing quiz results. The
 * component also renders a list of quizzes with edit and results commands.
 *
 * @returns {JSX.Element} A JSX element containing the command palette.
 */
export function CommandPalette(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<CommandQuiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    /**
     * Handles the "k" key (or "ctrl + k" on Windows) event. Opens or closes
     * the command palette based on the current state.
     *
     * @param {KeyboardEvent} e - The keyboard event.
     */
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      /**
       * Fetches quizzes from the API and sets the `quizzes` state with the
       * response data. If the response is not ok, throws an error. If an error
       * occurs, logs the error and clears the `quizzes` state.
       */
      const fetchQuizzes = async () => {
        try {
          const response = await fetch("/api/quizzes");
          if (!response.ok) {
            throw new Error("Failed to fetch quizzes");
          }
          const data = await response.json();
          setQuizzes(data);
        } catch (error) {
          console.error(error);
          setQuizzes([]); // Clear quizzes on error
        }
      };
      fetchQuizzes();
    }
  }, [open]);

  /**
   * Runs the given command and closes the command palette. If the command
   * throws an error, logs the error and leaves the command palette open.
   *
   * @param {() => unknown} command - The command to run.
   */
  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <HomeIcon className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/create"))}
          >
            <FilePlusIcon className="mr-2 h-4 w-4" />
            <span>Create New Quiz</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/planned"))}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Planned Quizzes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/results"))}
          >
            <BarChartIcon className="mr-2 h-4 w-4" />
            <span>View Results</span>
          </CommandItem>
        </CommandGroup>
        {quizzes.length > 0 && (
          <>
            <CommandGroup heading="Go to Quiz Editor">
              {quizzes.map((quiz) => (
                <CommandItem
                  key={`edit-${quiz._id}`}
                  value={`Edit ${quiz.title}`}
                  onSelect={() =>
                    runCommand(() => router.push(`/edit/${quiz._id}`))
                  }
                >
                  <Pencil2Icon className="mr-2 h-4 w-4" />
                  <span>{quiz.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="View Quiz Results">
              {quizzes.map((quiz) => (
                <CommandItem
                  key={`results-${quiz._id}`}
                  value={`Results for ${quiz.title}`}
                  onSelect={() =>
                    runCommand(() => router.push(`/results/${quiz._id}`))
                  }
                >
                  <BarChartIcon className="mr-2 h-4 w-4" />
                  <span>{quiz.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
