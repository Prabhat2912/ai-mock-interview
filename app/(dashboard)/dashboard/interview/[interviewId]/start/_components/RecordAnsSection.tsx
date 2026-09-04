/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { Loader2, Mic, StopCircle, Video } from "lucide-react";
import { toast } from "sonner";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import { uploadVideoToCloudinary } from "@/utils/cloudinary";

type SpeechResult = string | { transcript: string; timestamp?: number };

const RecordAnsSection = ({
  question,
  activeQuestionIndex,
  interViewData,
  interviewSessionId,
}: {
  question: mockInterviewQuestionsRes[];
  activeQuestionIndex: number;
  interViewData: jobResponse[];
  interviewSessionId: string;
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
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const latestAnswerRef = useRef("");
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-callable ref to the stop routine so the auto-stop timer never
  // captures a stale `isRecording` closure.
  const stopAndSaveRef = useRef<(autoStopped?: boolean) => Promise<void>>(
    async () => {},
  );

  // Backend behavior-analysis caps (must match the Flask service limits).
  const MAX_VIDEO_SEC = parseInt(
    process.env.NEXT_PUBLIC_MAX_VIDEO_DURATION_SEC || "60",
    10,
  );
  const BEHAVIOR_MAX_MB = parseInt(
    process.env.NEXT_PUBLIC_BEHAVIOR_MAX_MB || "25",
    10,
  );

  const clearAutoStop = () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  };

  useEffect(() => {
    const transcript = (results as SpeechResult[])
      .map((r) => (typeof r === "string" ? r : r.transcript))
      .join(" ");
    setUserAnswer(transcript);
    latestAnswerRef.current = transcript;
  }, [results]);

  // Reset on question switch.
  useEffect(() => {
    if (isRecording) {
      try {
        stopSpeechToText();
      } catch {}
    }
    clearAutoStop();
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    setResults([]);
    setUserAnswer("");
    latestAnswerRef.current = "";
    setLoading(false);
  }, [activeQuestionIndex]);

  // Clear the auto-stop timer on unmount.
  useEffect(() => () => clearAutoStop(), []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch (err) {
      console.error("getUserMedia failed", err);
      const msg = (err as Error)?.message || String(err);
      setCameraError(
        `Camera access failed: ${msg}. Click the lock icon in the URL bar, allow Camera + Microphone, and reload.`,
      );
      setCameraReady(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const startMediaRecorder = (): boolean => {
    const stream = streamRef.current;
    if (!stream || stream.getVideoTracks().length === 0) {
      toast.error("Camera not ready yet.");
      return false;
    }
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
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
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        recordedChunksRef.current = [];
        resolve(blob);
      };
      rec.stop();
    });

  const stopAndSave = async (autoStopped = false) => {
    try {
      stopSpeechToText();
    } catch {}
    clearAutoStop();
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
        const sizeMb = blob.size / (1024 * 1024);
        if (sizeMb > BEHAVIOR_MAX_MB) {
          toast.warning(
            `Video is ~${sizeMb.toFixed(1)}MB; behavior analysis caps at ` +
              `${BEHAVIOR_MAX_MB}MB and may be skipped. Answer is still saved.`,
          );
        }
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
          interviewSessionId,
          question: question[activeQuestionIndex].question,
          correctAns: question[activeQuestionIndex].answer,
          userAns: answer,
          videoUrl,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success(
        autoStopped
          ? `Recording auto-stopped at ${MAX_VIDEO_SEC}s. Answer saved with AI + behavior analysis.`
          : "Answer saved with AI + behavior analysis.",
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving the answer.");
    } finally {
      setUserAnswer("");
      latestAnswerRef.current = "";
      setResults([]);
      setLoading(false);
    }
  };
  // Keep the ref fresh every render for the auto-stop timer.
  stopAndSaveRef.current = stopAndSave;

  const handleRecordClick = async () => {
    if (isRecording) {
      await stopAndSaveRef.current(false);
    } else {
      if (!cameraReady) {
        toast.error("Camera not ready. Allow permission and wait a moment.");
        return;
      }
      setUserAnswer("");
      latestAnswerRef.current = "";
      setResults([]);
      // Wait so previous SpeechRecognition fully releases before restarting.
      await new Promise((r) => setTimeout(r, 400));
      const ok = startMediaRecorder();
      if (!ok) return;
      try {
        startSpeechToText();
      } catch (err) {
        console.error("startSpeechToText failed", err);
        toast.error("Could not start speech recognition. Click Record again.");
      }
      // Backend rejects videos longer than MAX_VIDEO_SEC — auto-stop so the
      // clip stays analyzable instead of failing server-side later.
      clearAutoStop();
      autoStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state !== "inactive") {
          toast.info(
            `Reached the ${MAX_VIDEO_SEC}s recording limit — stopping automatically.`,
          );
          void stopAndSaveRef.current(true);
        }
      }, MAX_VIDEO_SEC * 1000);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col bg-black justify-center items-center rounded-lg p-5 mt-20 relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            height: 300,
            width: "100%",
            transform: "scaleX(-1)",
            display: cameraReady ? "block" : "none",
          }}
        />
        {!cameraReady && (
          <div className="flex flex-col items-center gap-3 p-4">
            <Image src="/webcam.png" alt="Camera" width={150} height={150} />
            {cameraError ? (
              <>
                <p className="text-xs text-red-400 max-w-xs text-center">
                  {cameraError}
                </p>
                <Button size="sm" variant="secondary" onClick={startCamera}>
                  <Video className="h-4 w-4 mr-1" /> Retry camera
                </Button>
              </>
            ) : (
              <p className="text-xs text-gray-400">Requesting camera…</p>
            )}
          </div>
        )}
      </div>
      <Button
        disabled={loading || !cameraReady}
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
