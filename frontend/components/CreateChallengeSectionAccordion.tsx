"use client";
import { ChevronRight, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  title: string;
 description?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function CreateChallengeSectionAccordion({
  title,
  description,
  isOpen,
  onToggle,
}: Props) {
  return (
    <div
      className={`outline outline-primary outline-[2px] px-2 py-1 rounded-md transition-colors ${
        isOpen ? "bg-white" : "bg-primary"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className={`transition-colors ${isOpen ? "text-primary" : "text-white"}`}>
          {title}
        </h2>
        <button
          onClick={onToggle}
          className={`text-sm italic transition-colors ${isOpen ? "text-primary" : "text-white"}`}
        >
          <span className="inline-flex items-center">
            {isOpen ? "Hide" : "Learn more"}
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </span>
        </button>
      </div>

      <div
        className={`text-sm text-gray-500 px-1 italic transition-all duration-500 ease-in-out transform ${
          isOpen
            ? "opacity-100 translate-y-0 max-h-96 pt-2"
            : "opacity-0 -translate-y-5 max-h-0 overflow-hidden"
        }`}
      >
        {description}
      </div>
    </div>
  );
}