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
    <div className="p-4 min-h-[800px] transition-all flex flex-col gap-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2  gap-10">
        {!loading &&
        mockInterviewQuestions &&
        mockInterviewQuestions.length > 0 ? (
          <QuestionSection
            question={mockInterviewQuestions}
            activeQuestionIndex={activeQuestionIndex}
            setActiveQuestionIndex={setActiveQuestionIndex}
          />
        ) : (
          <div className="w-full h-[400px] border rounded-lg p-4 ">
            <div className="bg-gray-300 animate-pulse w-full h-full "></div>
          </div>
        )}

        <RecordAnsSection
          interViewData={interviewData}
          question={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
          interviewSessionId={interviewSessionId}
        />
      </div>
      <div className="flex gap-4  ">
        <Button
          onClick={() => {
            if (activeQuestionIndex > 0) {
              setActiveQuestionIndex(activeQuestionIndex - 1);
            }
          }}
        >
          Previous Question
        </Button>
        {activeQuestionIndex < mockInterviewQuestions.length - 1 ? (
          <Button
            onClick={() => {
              if (activeQuestionIndex < mockInterviewQuestions.length - 1) {
                setActiveQuestionIndex(activeQuestionIndex + 1);
              }
            }}
          >
            Next Question
          </Button>
        ) : (
          <Link
            href={`/dashboard/interview/${resolvedParams?.interviewId}/feedback`}
          >
            <Button onClick={triggerBatchAnalysis}>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Start;
