/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Loader2, Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import { uploadVideoToCloudinary } from "@/utils/cloudinary";

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
  const [loading, setLoading] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);

  const webcamRef = useRef<Webcam | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  // capture the latest transcript at stop time without re-running save effect
  const latestAnswerRef = useRef("");

  useEffect(() => {
    const transcript = (results as SpeechResult[])
      .map((r) => (typeof r === "string" ? r : r.transcript))
      .join(" ");
    setUserAnswer(transcript);
    latestAnswerRef.current = transcript;
  }, [results]);

  const startMediaRecorder = () => {
    const stream = webcamRef.current?.stream;
    if (!stream) {
      toast.error("Webcam stream not ready yet, try again in a second.");
      return false;
    }
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType });
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    rec.start(1000);
    mediaRecorderRef.current = rec;
    return true;
  };

  const stopMediaRecorderAndGetBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const rec = mediaRecorderRef.current;
      if (!rec || rec.state === "inactive") return resolve(null);
      rec.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        recordedChunksRef.current = [];
        resolve(blob);
      };
      rec.stop();
    });

  const handleRecordClick = async () => {
    if (isRecording) {
      // Stop branch — capture both transcript and video, then upload + save.
      stopSpeechToText();
      setLoading(true);
      try {
        const blob = await stopMediaRecorderAndGetBlob();
        const answer = latestAnswerRef.current;

        if (!answer || answer.length < 10) {
          toast.error("Answer too short. Please record a longer response.");
          return;
        }

        let videoUrl: string | undefined;
        if (blob && blob.size > 0) {
          try {
            videoUrl = await uploadVideoToCloudinary(blob);
          } catch (err) {
            console.error(err);
            toast.warning("Video upload failed; saving answer without video.");
          }
        }

        const res = await fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mockId: interViewData[0]?.mockId,
            question: question[activeQuestionIndex].question,
            correctAns: question[activeQuestionIndex].answer,
            userAns: answer,
            videoUrl,
          }),
        });

        if (!res.ok) throw new Error(await res.text());
        toast.success("Answer saved with AI + behavior analysis.");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while saving the answer.");
      } finally {
        setUserAnswer("");
        latestAnswerRef.current = "";
        setResults([]);
        setWebcamOn(false);
        setLoading(false);
      }
    } else {
      // Start branch — turn on webcam, then start MediaRecorder + speech-to-text.
      setUserAnswer("");
      latestAnswerRef.current = "";
      setWebcamOn(true);
      // Wait a tick for Webcam to acquire the stream before starting MediaRecorder.
      setTimeout(() => {
        const ok = startMediaRecorder();
        if (ok) startSpeechToText();
        else setWebcamOn(false);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col bg-black justify-center items-center rounded-lg p-5 mt-20">
        {webcamOn ? (
          <Webcam
            ref={webcamRef}
            audio
            muted
            mirrored
            videoConstraints={{ facingMode: "user" }}
            style={{ height: 300, width: "100%", zIndex: 50 }}
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
        onClick={handleRecordClick}
        className={`mt-10 ${!isRecording ? "text-primary" : "text-red-500"}`}
      >
        {loading ? (
          <div className="flex gap-2 justify-center items-center">
            <Loader2 className="animate-spin" />
            Analyzing...
          </div>
        ) : isRecording ? (
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
      {userAnswer && (
        <p className="mt-4 text-xs text-gray-500 max-w-md text-center">
          Live transcript: {userAnswer}
        </p>
      )}
    </div>
  );
};

export default RecordAnsSection;
