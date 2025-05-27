"use client";

import { JSX } from "react";
import type { FrontendQuestion, FrontendAnswer } from "../lib/types";
import { MeshCatalogCombobox } from "./MeshCatalogCombobox";
import { OrganGroupCombobox } from "./OrganGroupCombobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Props for EditQuestionBox
interface EditQuestionProps {
  index: number;
  question: FrontendQuestion;
  onChangeQuestionText: (index: number, newText: string) => void;
  onChangeQuestionType: (index: number, newType: string) => void;
  onChangeAnswerText: (
    questionIndex: number,
    answerIndex: number,
    newText: string
  ) => void;
  onSetCorrectAnswer: (questionIndex: number, answerIndex: number) => void;
  onAddAnswer: (questionIndex: number) => void;
  onRemoveAnswer: (questionIndex: number, answerIndex: number) => void;
  onRemoveQuestion: (questionIndex: number) => void;
  onChangeTargetType: (
    questionIndex: number,
    targetType: "mesh" | "group" | undefined
  ) => void;
  onChangeTargetId: (
    questionIndex: number,
    targetId: string | undefined
  ) => void;
}

/**
 * A component for editing a single question in a quiz.
 *
 * The component renders a form with input fields for the question text, type, and answers.
 * The component also renders a button to remove the question.
 * The component accepts a number of callbacks as props, which are used to update the
 * quiz state when the user interacts with the form. The callbacks are as follows:
 *
 * - `onChangeQuestionText`: Called when the user changes the question text.
 * - `onChangeQuestionType`: Called when the user changes the question type.
 * - `onChangeAnswerText`: Called when the user changes the text of an answer.
 * - `onSetCorrectAnswer`: Called when the user selects a correct answer.
 * - `onAddAnswer`: Called when the user adds a new answer.
 * - `onRemoveAnswer`: Called when the user removes an answer.
 * - `onRemoveQuestion`: Called when the user removes the question.
 * - `onChangeTargetType`: Called when the user changes the target type for a select-organ question.
 * - `onChangeTargetId`: Called when the user changes the target ID for a select-organ question.
 */
export default function EditQuestionBox({
  index,
  question,
  onChangeQuestionText,
  onChangeQuestionType,
  onChangeAnswerText,
  onSetCorrectAnswer,
  onAddAnswer,
  onRemoveAnswer,
  onRemoveQuestion,
  onChangeTargetType,
  onChangeTargetId,
}: EditQuestionProps): JSX.Element {
  const handleTypeChange = (value: string) => {
    onChangeQuestionType(index, value);
    // If type changes away from select-organ, clear target fields
    if (value !== "select-organ") {
      onChangeTargetType(index, undefined);
      onChangeTargetId(index, undefined);
    }
  };

  const handleTargetTypeUiChange = (value: "mesh" | "group") => {
    onChangeTargetType(index, value);
    onChangeTargetId(index, undefined); // Reset target ID when type changes
  };

  return (
    <div className="mb-6 border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">Question {index + 1}</Label>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemoveQuestion(index)}
        >
          Remove Question
        </Button>
      </div>

      <div>
        <Label htmlFor={`question-text-${index}`}>Question Text</Label>
        <Input
          id={`question-text-${index}`}
          type="text"
          value={question.questionText}
          onChange={(e) => onChangeQuestionText(index, e.target.value)}
          className="w-full p-2.5 font-bold mt-2"
          placeholder="Enter question text"
        />
      </div>

      <div>
        <Label htmlFor={`question-type-${index}`} className="mb-2">
          Question Type
        </Label>
        <Select value={question.type} onValueChange={handleTypeChange}>
          <SelectTrigger id={`question-type-${index}`}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
            <SelectItem value="true-false">True/False</SelectItem>
            <SelectItem value="select-organ">Select Organ</SelectItem>
            <SelectItem value="short-answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {question.type === "select-organ" && (
        <div className="space-y-3 p-3 border rounded-md bg-slate-50">
          <Label className="font-medium">
            Target Configuration (Select Organ)
          </Label>
          <div>
            <Label htmlFor={`target-type-${index}`} className="mb-2">
              Target Type
            </Label>
            <Select
              value={question.targetType}
              onValueChange={(value: "mesh" | "group") =>
                handleTargetTypeUiChange(value)
              }
            >
              <SelectTrigger id={`target-type-${index}`}>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mesh">Specific Mesh</SelectItem>
                <SelectItem value="group">Organ Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {question.targetType === "mesh" && (
            <div>
              <Label>Target Mesh</Label>
              <MeshCatalogCombobox
                selectedMeshId={question.target_id}
                onSelectMesh={(meshId) => onChangeTargetId(index, meshId)}
              />
            </div>
          )}
          {question.targetType === "group" && (
            <div>
              <Label>Target Group</Label>
              <OrganGroupCombobox
                selectedGroupId={question.target_id}
                onSelectGroup={(groupId) => onChangeTargetId(index, groupId)}
              />
            </div>
          )}
        </div>
      )}

      {(question.type === "multiple-choice" ||
        question.type === "true-false") && (
        <div className="space-y-3">
          <Label className="font-medium">Answers</Label>
          {question.answers?.map((answer, answerIndex) => (
            <div
              key={answer._id || answerIndex}
              className="flex items-center gap-2 p-2 border rounded"
            >
              <input
                type="radio"
                name={`correct-answer-${index}`}
                checked={answer.isCorrect}
                onChange={() => onSetCorrectAnswer(index, answerIndex)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <Input
                type="text"
                value={answer.text}
                onChange={(e) =>
                  onChangeAnswerText(index, answerIndex, e.target.value)
                }
                className="flex-1 p-2"
                placeholder={`Answer ${answerIndex + 1}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveAnswer(index, answerIndex)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => onAddAnswer(index)}
            variant="outline"
          >
            Add Answer
          </Button>
        </div>
      )}
      {/* Short-answer questions typically don't need predefined answers in the quiz creation UI */}
    </div>
  );
}
