"use client";
import { mockInterviewQuestionsRes } from "@/types/types";
import { Lightbulb, Volume2 } from "lucide-react";
import React, { useEffect } from "react";

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
      // Cancel any ongoing speech before starting new one
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Your browser doesn't support text to speech.");
    }
  };

  // Cleanup speech synthesis on component unmount or page reload
  useEffect(() => {
    // Cleanup function runs when component unmounts (e.g., page reload)
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
      }
    };
  }, []); // Empty dependency array: runs only on mount and unmount

  return (
    question.length > 0 && (
      <div className="p-5 border rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {question &&
            question.map((q, index) => (
              <div key={index} onClick={() => setActiveQuestionIndex(index)}>
                <h2
                  className={`p-2 text-center cursor-pointer text-xs md:text-sm lg:text-base ${
                    activeQuestionIndex === index && "bg-primary text-white"
                  } rounded-full`}
                >
                  Question #{index + 1}
                </h2>
              </div>
            ))}
        </div>
        <h2 className="my-5 text-base md:text-lg">
          {question[activeQuestionIndex].question}
        </h2>
        <Volume2
          className="cursor-pointer"
          onClick={() => {
            textToSpeech(question[activeQuestionIndex].question);
            console.log("clicked");
          }}
        />
        <div className="border rounded-lg p-5 bg-blue-100 mt-20">
          <h2 className="flex gap-2 items-center text-primary">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className="text-sm my-2 text-primary">
            {process.env.NEXT_PUBLIC_QUESTION_NOTE}
          </h2>
        </div>
      </div>
    )
  );
};

export default QuestionSection;
