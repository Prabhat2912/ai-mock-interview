"use client";
import { mockInterviewQuestionsRes } from "@/types/types";
import { Volume2 } from "lucide-react";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

const QuestionSection = ({
  question,
  activeQuestionIndex,
  setActiveQuestionIndex,
}: {
  question: mockInterviewQuestionsRes[];
  activeQuestionIndex: number;
  setActiveQuestionIndex: (index: number) => void;
}) => {
  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    } else {
      alert("Your browser does not read text aloud.");
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    question.length > 0 && (
      <div className="flex h-full flex-col border border-stage/25 bg-paper">
        <div className="flex items-center justify-between border-b border-stage/20 px-5 py-3.5">
          <p className="tnum font-display text-sm font-semibold uppercase tracking-[0.2em] text-tungsten">
            Cue {activeQuestionIndex + 1} of {question.length}
          </p>
          <button
            onClick={() => textToSpeech(question[activeQuestionIndex].question)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-stage transition-colors hover:text-marquee-deep"
          >
            <Volume2 className="h-4 w-4" aria-hidden /> Hear it
          </button>
        </div>

        <ol className="flex flex-wrap gap-2 px-5 pt-4">
          {question.map((q, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveQuestionIndex(index)}
                aria-current={activeQuestionIndex === index ? "true" : undefined}
                aria-label={`Go to cue ${index + 1}`}
                className={cn(
                  "tnum px-3 py-1.5 font-display text-sm font-semibold tracking-[0.12em] transition-colors",
                  activeQuestionIndex === index
                    ? "bg-stage text-paper"
                    : index < activeQuestionIndex
                      ? "bg-paper-deep text-stage hover:bg-paper-line"
                      : "border border-stage/25 text-tungsten hover:border-stage hover:text-stage"
                )}
              >
                Q{index + 1}
              </button>
            </li>
          ))}
        </ol>

        <div className="m-5 mb-0 flex-1 bg-stage p-5 text-paper sm:p-6">
          <p className="text-base font-medium leading-relaxed sm:text-lg">
            {question[activeQuestionIndex].question}
          </p>
        </div>

        <p className="m-5 mt-4 bg-paper-deep/60 p-4 text-sm leading-relaxed text-stage/80">
          {process.env.NEXT_PUBLIC_QUESTION_NOTE ||
            "Work point, reason, example. Forty-five to sixty seconds, then stop and save."}
        </p>
      </div>
    )
  );
};

export default QuestionSection;
