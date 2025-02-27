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
    const transcript = results.map((result) => result.transcript).join(" ");
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
    try {
      const FeedbackPrompt =
        "Question:" +
        question[activeQuestionIndex].question +
        ", User Answer:" +
        userAnswer +
        ", Depends on quetsion and user answer for given interview quetsion " +
        "pls give rating for answer and feedback as area of improvement if any " +
        "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";
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
        toast.success("Your Answer is saved successfully!");
      }
    } catch (error) {
      console.log(error, "error while saving response to db");
      toast.error("Something went wrong, Please try again!");
    } finally {
      setLoading(true);
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
      <div className="flex flex-col bg-black justify-center items-center rounded-lg p-5 mt-20 ">
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
        className={`mt-10 ${!isRecording ? "text-primary" : "text-red-500"} `}
      >
        {" "}
        {isRecording ? (
          <div className="flex  gap-2 justify-center items-center">
            <StopCircle />
            Stop Recording
          </div>
        ) : (
          <div className="flex  gap-2 justify-center items-center">
            <Mic />
            Record Answer
          </div>
        )}
      </Button>
    </div>
  );
};

export default RecordAnsSection;
