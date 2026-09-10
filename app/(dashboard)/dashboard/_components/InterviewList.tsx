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
      if (data.length === 0) toast.info("The ledger is empty. Call your first mock above.");
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("The ledger could not be read. Reload and try again.");
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
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold uppercase leading-none tracking-tight">
          The ledger
        </h2>
        {!loading && Interviews && Interviews.length > 0 && (
          <p className="tnum text-sm font-bold text-tungsten">
            {Interviews.length} {Interviews.length === 1 ? "entry" : "entries"}
          </p>
        )}
      </div>

      {loading ? (
        <ul aria-label="Loading mocks" className="mt-4">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-[92px] animate-pulse border-t border-stage/15 bg-paper-deep/50 last:border-b"
            />
          ))}
        </ul>
      ) : Interviews && Interviews.length > 0 ? (
        <ul className="mt-4">
          {Interviews.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 border border-dashed border-stage/40 px-6 py-12 text-center">
          <p className="font-display text-2xl font-semibold uppercase tracking-wide">
            A blank call sheet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tungsten">
            No performances yet. Call your first mock above — thirty seconds
            of writing, then you are on.
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewList;
