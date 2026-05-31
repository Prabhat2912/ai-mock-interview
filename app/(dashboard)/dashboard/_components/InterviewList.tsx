"use client";
import { jobResponse } from "@/types/types";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InterviewItemCard from "./InterviewItemCard";

const InterviewList = () => {
  const { user } = useUser();
  const [Interviews, setInterviews] = useState<jobResponse[] | null>(null);
  const [loading, setLoading] = useState(true);

  const getInterviews = async () => {
    try {
      const res = await fetch("/api/interviews");
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as jobResponse[];
      setInterviews(data);
      if (data.length === 0) toast.info("No interviews found for this user");
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to fetch interviews");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getInterviews();
    }
  }, [user]);

  return (
    <div>
      <h2 className="font-medium text-xl">
        {!loading && Interviews && Interviews.length > 0
          ? " Previous Mock Interviews"
          : "No Previous Mock Interviews"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
        {!loading
          ? Interviews &&
            Interviews.length > 0 &&
            Interviews.map((interview, index) => (
              <InterviewItemCard interview={interview} key={index} />
            ))
          : [1, 2, 3, 4].map((_item, index) => (
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
