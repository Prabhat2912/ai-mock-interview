/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { jobResponse } from "@/types/types";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

interface Params {
  interviewId: string;
}

const Interview = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  const [camEnabled, setCamEnabled] = useState(false);
  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  const [interviewData, setInterviewData] = useState<jobResponse[]>([]);
  const getInterviewDetails = async () => {
    if (resolvedParams?.interviewId) {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, resolvedParams.interviewId));

      if (result) {
        setInterviewData(result as jobResponse[]);
      }
    }
  };
  useEffect(() => {
    getInterviewDetails();
  }, [resolvedParams]);

  return (
    <div className=" my-10 space-y-4 ">
      <h2 className="font-bold text-2xl">Let&apos;s Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 p-5 rounded-lg border">
            <h2 className="text-lg">
              <strong>Job Position/Role:</strong>
              {interviewData?.[0]?.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description:</strong>
              {interviewData?.[0]?.jobDescription}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience: </strong>
              {interviewData?.[0]?.jobExperience}
            </h2>
          </div>
          <div className="p-5 border rounded-lg text-yellow-500 border-yellow-300 bg-yellow-200">
            <h2 className="flex gap-2 items-center  ">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-2">{process.env.NEXT_PUBLIC_INFORMATION}</h2>
          </div>
        </div>
        <div>
          {camEnabled ? (
            <Webcam
              audio={true}
              mirrored={true}
              onUserMedia={() => setCamEnabled(true)}
              onUserMediaError={() => setCamEnabled(false)}
              style={{
                height: 300,
                width: "100%",
              }}
            />
          ) : (
            <div className="flex justify-center items-center flex-col gap-4">
              <WebcamIcon className="h-72 w-full p-20 rounded-lg border bg-secondary " />
              <Button variant={"ghost"} onClick={() => setCamEnabled(true)}>
                Enable Web Cam and Mic
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end">
        <Link
          href={`/dashboard/interview/${resolvedParams?.interviewId}/start`}
        >
          <Button>Start</Button>
        </Link>
      </div>
    </div>
  );
};

export default Interview;
