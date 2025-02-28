/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnsSection from "./_components/RecordAnsSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
interface Params {
  interviewId: string;
}
const Start = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);
  const [interviewData, setInterviewData] = useState<jobResponse[]>([]);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState<
    mockInterviewQuestionsRes[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const getInterviewDetails = async () => {
    try {
      if (resolvedParams?.interviewId) {
        const result = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, resolvedParams.interviewId));
        console.log(result, "result at start");
        if (result) {
          setInterviewData(result as jobResponse[]);
          const q = JSON.parse(result[0].jsonMockResp);
          console.log(q);
          setMockInterviewQuestions(q);

          console.log(mockInterviewQuestions, "mockInterviewQuestions");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching interview details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getInterviewDetails();
  }, [resolvedParams]);
  return (
    <div className="p-4 min-h-[800px] transition-all flex flex-col gap-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2  gap-10">
        {/* Questions */}
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

        {/* Video/ Audio Recording  */}
        <RecordAnsSection
          interViewData={interviewData}
          question={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
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
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Start;
