"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Params } from "next/dist/server/request/params";
import { InterviewFeedback } from "@/types/types";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Feedback = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  const [results, setResults] = useState<InterviewFeedback[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [behaviorPending, setBehaviorPending] = useState(false);

  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  const getResults = async () => {
    if (
      !resolvedParams?.interviewId ||
      typeof resolvedParams.interviewId !== "string"
    ) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/answers/${resolvedParams.interviewId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as InterviewFeedback[];
      setResults(data);
      const pending = data.some(
        (r) => r.videoUrl && !r.behaviorJson && !r.confidenceScore
      );
      setBehaviorPending(pending);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams) getResults();
  }, [resolvedParams]);

  // Poll every 15s while behavior results are still pending.
  useEffect(() => {
    if (!behaviorPending) return;
    const id = setInterval(() => {
      getResults();
    }, 15000);
    return () => clearInterval(id);
  }, [behaviorPending, resolvedParams]);

  const getAvgRating = () => {
    if (results?.length) {
      const total = results.reduce(
        (acc, curr) => acc + parseFloat(curr.rating || "0"),
        0
      );
      return (total / results.length).toFixed(1);
    }
    return "0";
  };

  const avgConfidence = () => {
    const vals = (results || [])
      .map((r) => parseFloat(r.confidenceScore || ""))
      .filter((n) => !Number.isNaN(n));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const avgNervousness = () => {
    const vals = (results || [])
      .map((r) => parseFloat(r.nervousnessScore || ""))
      .filter((n) => !Number.isNaN(n));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-green-500 font-bold text-2xl mt-4">
        Congratulations!
      </h2>
      <h2 className="font-bold text-2xl mt-4">Here is your feedback</h2>
      <h2 className="text-lg text-violet-800 font-semibold mt-4">
        Your Overall Interview Rating is:{" "}
        {!loading && results !== null ? `${getAvgRating()}/5` : "N/A"}
      </h2>
      {!loading && results && results.length > 0 && (
        <div className="flex gap-6 mt-2 text-sm">
          {avgConfidence() !== null && (
            <span className="text-emerald-700">
              Avg confidence (−1 to 1): <strong>{avgConfidence()}</strong>
            </span>
          )}
          {avgNervousness() !== null && (
            <span className="text-orange-700">
              Avg nervousness (−1 to 1): <strong>{avgNervousness()}</strong>
            </span>
          )}
        </div>
      )}
      <h2 className="text-sm text-gray-500 font-medium mt-4">
        {results && results.length > 0
          ? "Find below each question with the correct answer, your answer, AI feedback, and behavior analysis."
          : !loading
          ? "No feedback found"
          : "Loading feedbacks..."}
      </h2>
      {behaviorPending && (
        <div className="mt-3 p-3 rounded-lg border border-amber-400 bg-amber-50 text-amber-900 text-sm flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Behavior analysis is running in the background. This page will update
          automatically when the results are ready (can take a few minutes per
          answer).
        </div>
      )}
      <div className="h-[600px] p-4 border rounded-lg my-4 overflow-y-auto">
        {loading ? (
          <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="h-[350px] w-full bg-gray-200 animate-pulse rounded-lg "
              ></div>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          results.map((res, i) => (
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

                  {(res?.confidenceScore || res?.nervousnessScore || res?.videoUrl) && (
                    <div className="flex flex-col gap-2 bg-purple-50 border border-purple-300 rounded-lg p-3 text-sm text-purple-900">
                      <strong>Behavior Analysis</strong>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <span>Confidence: {res?.confidenceScore ?? "n/a"}</span>
                        <span>Nervousness: {res?.nervousnessScore ?? "n/a"}</span>
                        <span>Level: {res?.nervousnessLevel ?? "n/a"}</span>
                      </div>
                      {res?.videoUrl && (
                        <video
                          src={res.videoUrl}
                          controls
                          className="rounded-md max-h-64 mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            No feedback found
          </div>
        )}
      </div>
      <Link href="/dashboard">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
};

export default Feedback;
