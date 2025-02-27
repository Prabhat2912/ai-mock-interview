"use client";
import { jobResponse, mockInterviewQuestionsRes } from "@/types/types";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InterviewItemCard from "./InterviewItemCard";

const InterviewList = () => {
  const { user } = useUser();
  const [Interviews, setInterviews] = useState<jobResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const getInterviews = async () => {
    setLoading(true);
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const res = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview?.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(MockInterview.id));
      if (res.length > 0) {
        toast.success("Interviews fetched successfully");
        setInterviews(res);
      } else {
        toast.info("No interviews found for this user");
        setInterviews([]);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to fetch interviews");
      setInterviews([]);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      getInterviews();
    }
  }, [user]);
  useEffect(() => {
    console.log("Updated interviews:", Interviews);
  }, [Interviews]);
  return (
    <div>
      <h2 className="font-medium text-xl">Previous Mock Interview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
        {Interviews && Interviews.length > 0
          ? Interviews.map((interview, index) => (
              <InterviewItemCard interview={interview} key={index} />
            ))
          : [1, 2, 3, 4].map((item, index) => (
              <div
                key={index}
                className="h-[100px] w-full bg-gray-200 animate-pulse rounded-lg "
              ></div>
            ))}
      </div>
    </div>
  );
};

export default InterviewList;
