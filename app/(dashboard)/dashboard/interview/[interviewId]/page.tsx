/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";

interface Params {
  interviewId: string;
}

const Interview = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);

  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      console.log(resolvedParams.interviewId);
    }
  }, [resolvedParams]);
  const [interviewData, setInterviewData] = useState<unknown[]>([]);
  const getInterviewDetails = async () => {
    if (resolvedParams?.interviewId) {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, resolvedParams.interviewId));
      console.log(result);
      if (result) {
        setInterviewData(result);
        console.log(interviewData);
      }
    }
  };
  useEffect(() => {
    getInterviewDetails();
  }, [resolvedParams]);

  return <div>interview</div>;
};

export default Interview;
