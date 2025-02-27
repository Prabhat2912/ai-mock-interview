"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserAns } from "@/utils/schema";
import { db } from "@/utils/db";
import { Params } from "next/dist/server/request/params";
import { eq } from "drizzle-orm";
import { InterviewFeedback } from "@/types/types";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Feedback = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  const [results, setResults] = useState<InterviewFeedback[] | null>(null); // Start as null for uninitialized state
  const [loading, setLoading] = useState(false);

  // Resolve params from Promise
  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  const getResults = async () => {
    if (
      !resolvedParams?.interviewId ||
      typeof resolvedParams.interviewId !== "string"
    ) {
      console.error(
        "Invalid or missing interviewId:",
        resolvedParams?.interviewId
      );
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await db
        .select()
        .from(UserAns)
        .where(eq(UserAns.mockIdRef, resolvedParams.interviewId))
        .orderBy(UserAns.id);

      setResults(res as InterviewFeedback[]);
      console.log("Fetched results:", res);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when resolvedParams changes, but only if interviewId is valid
  useEffect(() => {
    if (resolvedParams) {
      getResults();
    }
  }, [resolvedParams]);

  const getAvgRating = () => {
    if (results?.length) {
      const total = results.reduce(
        (acc, curr) => acc + parseInt(curr.rating || "0"),
        0
      );
      return (total / results.length).toFixed(1); // Round to 1 decimal
    }
    return "0";
  };

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-green-500 font-bold text-2xl mt-4">
        Congratulation!
      </h2>
      <h2 className="font-bold text-2xl mt-4">Here is your feedback</h2>
      <h2 className="text-lg text-violet-800 font-semibold mt-4">
        Your Overall Interview Rating is:{" "}
        {!loading && results !== null ? `${getAvgRating()}/10` : "Loading..."}
      </h2>
      <h2 className="text-sm text-gray-500 font-medium mt-4">
        {results && results.length > 0
          ? "Find below interview question with correct answer, your answer, and feedback for improvement"
          : "No feedback found"}
      </h2>
      <div>
        {loading ? (
          <p>Loading feedback...</p>
        ) : (
          results?.map((res, i) => (
            <Collapsible key={i} className="w-full">
              <CollapsibleTrigger className="text-left flex justify-between gap-7 w-full bg-secondary rounded-lg p-2 my-2">
                {res?.question} <ChevronsUpDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-4">
                  <h2 className="font-bold text-red-500 p-2 border rounded-lg">
                    <strong>Rating: </strong>
                    {res?.rating || "N/A"}
                  </h2>
                  <h2 className="flex flex-col text-red-900 bg-red-50 text-sm p-2 rounded-lg border border-red-500">
                    <strong>Your Answer: </strong>
                    {res?.userAns || "No answer provided"}
                  </h2>
                  <h2 className="flex flex-col text-green-900 bg-green-50 text-sm p-2 rounded-lg border border-green-500">
                    <strong>Correct Answer: </strong>
                    {res?.correctAns || "Not available"}
                  </h2>
                  <h2 className="flex flex-col text-blue-900 bg-blue-50 text-sm p-2 rounded-lg border border-blue-500">
                    <strong>Feedback: </strong>
                    {res?.feedback || "No feedback provided"}
                  </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
      <Link href="/dashboard">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export default Feedback;
