/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAns } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

// Define the expected type for speech-to-text results
type SpeechResult = string | { transcript: string; timestamp?: number };

const RecordAnsSection = ({
  question,
  activeQuestionIndex,
  interViewData,
}: {
  question: mockInterviewQuestionsRes[];
  activeQuestionIndex: number;
  interViewData: jobResponse[];
}) => {
  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [webcam, setWebcam] = useState(false);

  useEffect(() => {
    const transcript = (results as SpeechResult[])
      .map((result) =>
        typeof result === "string" ? result : result.transcript
      )
      .join(" ");
    setUserAnswer(transcript);
  }, [results]);

  const SaveUserAns = async () => {
    if (isRecording) {
      stopSpeechToText();
      setWebcam(false);
    } else {
      setUserAnswer("");
      setWebcam(true);
      startSpeechToText();
    }
  };

  const saveUserAnsInDB = async () => {
    if (userAnswer.length < 10) {
      toast.error("Answer too short. Please record a longer response.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const FeedbackPrompt = `Question: ${question[activeQuestionIndex].question}, User Answer: ${userAnswer}, Depends on question and user answer for given interview question, please give a rating for the answer and feedback as area of improvement if any in just 3 to 5 lines in JSON format with "rating" and "feedback" fields`;
      const result = await chatSession.sendMessage(FeedbackPrompt);
      const mockJsonResponse = result.response
        .text()
        .replace("```json", "")
        .replace("```", "");
      console.log(mockJsonResponse);
      const jsonFeedbackResp = JSON.parse(mockJsonResponse);

      const res = await db.insert(UserAns).values({
        mockIdRef: interViewData[0].mockId,
        question: question[activeQuestionIndex].question,
        correctAns: question[activeQuestionIndex].answer,
        userAns: userAnswer,
        feedback: jsonFeedbackResp.feedback,
        rating: jsonFeedbackResp.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress || "",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      if (res) {
        toast.success("Your answer is saved successfully!");
      }
    } catch (error) {
      console.error("Error saving response to DB:", error);
      toast.error("Something went wrong, please try again!");
    } finally {
      setLoading(false);
      setUserAnswer("");
      setResults([]);
    }
  };

  useEffect(() => {
    if (!isRecording && userAnswer && !loading) {
      saveUserAnsInDB();
    }
  }, [isRecording, userAnswer]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col bg-black justify-center items-center rounded-lg p-5 mt-20">
        {webcam ? (
          <Webcam
            mirrored
            style={{
              height: 300,
              width: "100%",
              zIndex: 10,
            }}
          />
        ) : (
          <Image
            src="/webcam.png"
            alt="Record Answer"
            width={200}
            height={200}
          />
        )}
      </div>
      <Button
        disabled={loading}
        variant={"outline"}
        onClick={SaveUserAns}
        className={`mt-10 ${!isRecording ? "text-primary" : "text-red-500"}`}
      >
        {isRecording ? (
          <div className="flex gap-2 justify-center items-center">
            <StopCircle />
            Stop Recording
          </div>
        ) : (
          <div className="flex gap-2 justify-center items-center">
            <Mic />
            Record Answer
          </div>
        )}
      </Button>
    </div>
  );
};

export default RecordAnsSection;
