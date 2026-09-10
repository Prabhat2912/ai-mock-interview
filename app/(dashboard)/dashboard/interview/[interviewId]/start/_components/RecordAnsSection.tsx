/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { Loader2, Mic, Square, Video } from "lucide-react";
import { toast } from "sonner";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import { uploadVideoToCloudinary } from "@/utils/cloudinary";
import { cn } from "@/lib/utils";

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
  const stopAndSaveRef = useRef<(autoStopped?: boolean) => Promise<void>>(
    async () => {},
  );
  // Live mic meter: reads the real microphone, never a fake value.
  const meterFillRef = useRef<HTMLDivElement | null>(null);
  const meterWrapRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const meterRafRef = useRef<number>(0);

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

  const stopMeter = () => {
    if (meterRafRef.current) cancelAnimationFrame(meterRafRef.current);
    meterRafRef.current = 0;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (meterFillRef.current) meterFillRef.current.style.width = "0%";
  };

  const startMeter = (stream: MediaStream) => {
    try {
      stopMeter();
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const level = Math.min(1, Math.sqrt(sum / data.length) * 3);
        if (meterFillRef.current) {
          meterFillRef.current.style.width = `${Math.round(level * 100)}%`;
        }
        if (meterWrapRef.current) {
          meterWrapRef.current.setAttribute(
            "aria-valuenow",
            String(Math.round(level * 100)),
          );
        }
        meterRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Meter is a nicety; recording works without it.
    }
  };

  useEffect(() => {
    const transcript = (results as SpeechResult[])
      .map((r) => (typeof r === "string" ? r : r.transcript))
      .join(" ");
    setUserAnswer(transcript);
    latestAnswerRef.current = transcript;
  }, [results]);

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
      startMeter(stream);
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
      stopMeter();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const startMediaRecorder = (): boolean => {
    const stream = streamRef.current;
    if (!stream || stream.getVideoTracks().length === 0) {
      toast.error("Camera not ready yet. Wait a moment and try again.");
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
        toast.error("That answer is too short to score. Give it another take.");
        return;
      }

      let videoUrl: string | undefined;
      if (blob && blob.size > 0) {
        const sizeMb = blob.size / (1024 * 1024);
        if (sizeMb > BEHAVIOR_MAX_MB) {
          toast.warning(
            `Video is ~${sizeMb.toFixed(1)}MB; behavior readings cap at ` +
              `${BEHAVIOR_MAX_MB}MB and may be skipped. The answer is still saved.`,
          );
        }
        try {
          videoUrl = await uploadVideoToCloudinary(blob);
        } catch (err) {
          console.error(err);
          toast.warning("Video upload failed; saving the answer without video.");
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
          ? `Stopped at the ${MAX_VIDEO_SEC}s limit. Answer saved and sent for scoring.`
          : "Answer saved and sent for scoring.",
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong saving the answer. Try once more.");
    } finally {
      setUserAnswer("");
      latestAnswerRef.current = "";
      setResults([]);
      setLoading(false);
    }
  };
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
      await new Promise((r) => setTimeout(r, 400));
      const ok = startMediaRecorder();
      if (!ok) return;
      try {
        startSpeechToText();
      } catch (err) {
        console.error("startSpeechToText failed", err);
        toast.error("Speech recognition did not start. Press record again.");
      }
      clearAutoStop();
      autoStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state !== "inactive") {
          toast.info(
            `Reached the ${MAX_VIDEO_SEC}s limit — stopping automatically.`,
          );
          void stopAndSaveRef.current(true);
        }
      }, MAX_VIDEO_SEC * 1000);
    }
  };

  return (
    <div className="flex h-full flex-col border border-stage/25 bg-paper">
      <div className="flex items-center justify-between border-b border-stage/20 px-5 py-3.5">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tungsten">
          Your take
        </p>
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em]",
            isRecording ? "text-marquee-deep" : "text-tungsten"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block h-2.5 w-2.5 rounded-full",
              isRecording ? "animate-lamp bg-marquee" : "bg-stage/25"
            )}
          />
          {isRecording ? "On air" : "Off air"}
        </p>
      </div>

      <div className="px-5 pt-4">
        <div className="relative overflow-hidden bg-stage">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Camera preview"
            style={{
              height: 300,
              width: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: cameraReady ? "block" : "none",
            }}
          />
          {!cameraReady && (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <Image src="/webcam.png" alt="" width={110} height={110} className="opacity-80" />
              {cameraError ? (
                <>
                  <p className="mt-3 max-w-xs text-xs leading-relaxed text-paper/80">
                    {cameraError}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3 rounded-none"
                    onClick={startCamera}
                  >
                    <Video className="mr-1 h-4 w-4" aria-hidden /> Retry camera
                  </Button>
                </>
              ) : (
                <p className="mt-3 text-xs font-medium text-paper/60">
                  Asking for the camera…
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
            Mic
          </span>
          <div
            ref={meterWrapRef}
            role="meter"
            aria-label="Microphone level"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            className="h-2 flex-1 bg-paper-deep"
          >
            <div ref={meterFillRef} className="h-full bg-marquee" style={{ width: "0%" }} />
          </div>
          <span className="tnum text-xs font-bold text-tungsten">
            Q{activeQuestionIndex + 1} · {MAX_VIDEO_SEC}s max
          </span>
        </div>
      </div>

      <div className="px-5 pt-4">
        <Button
          disabled={loading || !cameraReady}
          onClick={handleRecordClick}
          className={cn(
            "h-12 w-full rounded-none text-sm font-bold uppercase tracking-[0.1em] disabled:opacity-50",
            isRecording
              ? "bg-[#A4262C] text-paper hover:bg-[#7f1d22]"
              : "btn-marquee"
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" aria-hidden />
              Scoring…
            </span>
          ) : isRecording ? (
            <span className="flex items-center justify-center gap-2">
              <Square className="h-4 w-4" aria-hidden /> Cut — save the take
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Mic className="h-4 w-4" aria-hidden /> Record the take
            </span>
          )}
        </Button>
      </div>

      <div className="m-5 mt-4 border border-stage/20 bg-paper-deep/50 p-4">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
          Transcript
        </p>
        <p aria-live="polite" className="mt-1 line-clamp-3 min-h-[3rem] text-sm leading-relaxed text-stage/80">
          {userAnswer || "Your words land here while you speak."}
        </p>
      </div>
    </div>
  );
};

export default RecordAnsSection;
