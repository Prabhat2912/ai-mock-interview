/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import QuestionSection from "./_components/QuestionSection";
import type RecordAnsSectionType from "./_components/RecordAnsSection";
const RecordAnsSection = dynamic<
  React.ComponentProps<typeof RecordAnsSectionType>
>(() => import("./_components/RecordAnsSection"), { ssr: false });
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface Params {
  interviewId: string;
}

const Start = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  const [interviewData, setInterviewData] = useState<jobResponse[]>([]);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState<
    mockInterviewQuestionsRes[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [interviewSessionId, setInterviewSessionId] = useState<string>("");

  // Generate session ID on component mount
  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setInterviewSessionId(sessionId);
    // Store in session storage for persistence across page reloads
    sessionStorage.setItem(
      `interview_${resolvedParams?.interviewId}_session`,
      sessionId,
    );
  }, [resolvedParams?.interviewId]);

  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  const getInterviewDetails = async () => {
    try {
      if (!resolvedParams?.interviewId) return;
      const res = await fetch(`/api/interviews/${resolvedParams.interviewId}`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as jobResponse[];
      setInterviewData(data);
      if (data[0]?.jsonMockResp) {
        setMockInterviewQuestions(JSON.parse(data[0].jsonMockResp));
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching interview details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams) getInterviewDetails();
  }, [resolvedParams]);

  const triggerBatchAnalysis = () => {
    const mockId = interviewData[0]?.mockId;
    if (!mockId) return;
    // Fire-and-forget; backend may take several minutes. Feedback page polls for results.
    fetch("/api/answers/analyze-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mockId, interviewSessionId }),
      keepalive: true,
    }).catch((err) => console.warn("Batch analysis kickoff failed", err));
    toast.info(
      "Behavior analysis started in the background. It will appear on the feedback page when ready.",
    );
  };

  return (
    <div className="flex min-h-[700px] flex-col gap-5 py-8">
      <div className="flex flex-col gap-2 bg-stage px-5 py-4 text-paper sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display text-lg font-semibold uppercase tracking-[0.14em]">
          {interviewData[0]?.jobPosition || "Performance in progress"}
        </p>
        <p className="tnum text-sm font-bold text-paper/60">
          Cue {activeQuestionIndex + 1} of {mockInterviewQuestions.length || "…"}
          <span aria-hidden> · </span>
          {interviewSessionId ? `N-${interviewSessionId.slice(-4).toUpperCase()}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        {!loading &&
        mockInterviewQuestions &&
        mockInterviewQuestions.length > 0 ? (
          <QuestionSection
            question={mockInterviewQuestions}
            activeQuestionIndex={activeQuestionIndex}
            setActiveQuestionIndex={setActiveQuestionIndex}
          />
        ) : (
          <div
            aria-label="Loading cues"
            className="h-[480px] animate-pulse border border-stage/15 bg-paper-deep/50"
          />
        )}

        <RecordAnsSection
          interViewData={interviewData}
          question={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
          interviewSessionId={interviewSessionId}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 border border-stage/25 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          className="rounded-none border-stage/40 font-bold uppercase tracking-[0.08em] text-stage hover:bg-paper-deep disabled:opacity-40"
          disabled={activeQuestionIndex === 0}
          onClick={() => {
            if (activeQuestionIndex > 0) {
              setActiveQuestionIndex(activeQuestionIndex - 1);
            }
          }}
        >
          Previous cue
        </Button>
        <p className="text-center text-xs font-medium text-tungsten">
          Save each take before moving on — scoring runs backstage.
        </p>
        {activeQuestionIndex < mockInterviewQuestions.length - 1 ? (
          <Button
            className="rounded-none bg-stage font-bold uppercase tracking-[0.08em] text-paper hover:bg-stage-soft"
            onClick={() => {
              if (activeQuestionIndex < mockInterviewQuestions.length - 1) {
                setActiveQuestionIndex(activeQuestionIndex + 1);
              }
            }}
          >
            Next cue
          </Button>
        ) : (
          <Link
            href={`/dashboard/interview/${resolvedParams?.interviewId}/feedback`}
          >
            <Button
              onClick={triggerBatchAnalysis}
              className="btn-marquee w-full rounded-none sm:w-auto"
            >
              Ring down the curtain
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Start;
