"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Params } from "next/dist/server/request/params";
import { InterviewFeedback } from "@/types/types";
import { ChevronsUpDown, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SessionSummary {
  overall_assessment: string;
  strengths: string[];
  areas_for_improvement: string[];
  actionable_tips: string[];
}

interface SessionData {
  sessionId: string;
  sessionInfo?: {
    startedAt: string;
    endedAt: string | null;
    behavioralSummary: string | null;
    overallNervousnessLevel: string | null;
    overallConfidenceScore: string | null;
  };
  answers: InterviewFeedback[];
}

const Feedback = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  const [sessions, setSessions] = useState<SessionData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [behaviorPending, setBehaviorPending] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  const getResults = async () => {
    if (
      !resolvedParams?.interviewId ||
      typeof resolvedParams.interviewId !== "string"
    ) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      // First, assign session IDs to any legacy answers (without session ID)
      try {
        await fetch("/api/answers/assign-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mockId: resolvedParams.interviewId }),
        }).catch(() => {
          // Silently ignore if this fails - it's just for legacy data
        });
      } catch {
        // Ignore errors in legacy session assignment
      }

      const res = await fetch(`/api/answers/${resolvedParams.interviewId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as SessionData[];
      setSessions(data);

      const pending = data.some((session) =>
        session.answers.some(
          (r) => r.videoUrl && !r.behaviorJson && !r.confidenceScore,
        ),
      );
      setBehaviorPending(pending);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setSessions([]);
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

  const toggleSession = (sessionId: string) => {
    const newSet = new Set(expandedSessions);
    if (newSet.has(sessionId)) {
      newSet.delete(sessionId);
    } else {
      newSet.add(sessionId);
    }
    setExpandedSessions(newSet);
  };

  const getAvgRating = (answers: InterviewFeedback[]) => {
    if (answers?.length) {
      const total = answers.reduce(
        (acc, curr) => acc + parseFloat(curr.rating || "0"),
        0,
      );
      return (total / answers.length).toFixed(1);
    }
    return "0";
  };

  const avgConfidence = (answers: InterviewFeedback[]) => {
    const vals = (answers || [])
      .map((r) => parseFloat(r.confidenceScore || ""))
      .filter((n) => !Number.isNaN(n));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const avgNervousness = (answers: InterviewFeedback[]) => {
    const vals = (answers || [])
      .map((r) => parseFloat(r.nervousnessScore || ""))
      .filter((n) => !Number.isNaN(n));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const parseBehavioralSummary = (
    summaryJson: string | null,
  ): SessionSummary | null => {
    if (!summaryJson) return null;
    try {
      return JSON.parse(summaryJson);
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-green-500 font-bold text-2xl mt-4">
        Congratulations!
      </h2>
      <h2 className="font-bold text-2xl mt-4">Here is your feedback</h2>

      {behaviorPending && (
        <div className="mt-3 p-3 rounded-lg border border-amber-400 bg-amber-50 text-amber-900 text-sm flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Behavior analysis is running in the background. This page will update
          automatically when the results are ready (can take a few minutes per
          answer).
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="w-full flex flex-col gap-4 justify-center items-center">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-[200px] w-full bg-gray-200 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session, sessionIdx) => {
            const summary = parseBehavioralSummary(
              session.sessionInfo?.behavioralSummary ?? null,
            );
            const isExpanded = expandedSessions.has(session.sessionId);

            return (
              <div
                key={session.sessionId}
                className="border-2 border-indigo-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Session Header Card */}
                <button
                  onClick={() => toggleSession(session.sessionId)}
                  className="w-full p-4 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-lg text-indigo-900">
                      Interview Session {sessionIdx + 1}
                    </h3>
                    {session.sessionInfo && (
                      <p className="text-xs text-gray-600 mt-1">
                        Started: {formatDate(session.sessionInfo.startedAt)}
                        {session.sessionInfo.endedAt && (
                          <>
                            {" "}
                            • Ended: {formatDate(session.sessionInfo.endedAt)}
                          </>
                        )}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                      <span className="text-violet-700 font-semibold">
                        Rating: {getAvgRating(session.answers)}/5
                      </span>
                      {avgConfidence(session.answers) !== null && (
                        <span className="text-emerald-700">
                          Avg Confidence: {avgConfidence(session.answers)}
                        </span>
                      )}
                      {avgNervousness(session.answers) !== null && (
                        <span className="text-orange-700">
                          Avg Nervousness: {avgNervousness(session.answers)}
                        </span>
                      )}
                      {session.sessionInfo?.overallNervousnessLevel && (
                        <span className="text-blue-700">
                          Level: {session.sessionInfo.overallNervousnessLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-6 w-6 text-indigo-600 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-indigo-200 p-4 bg-white">
                    {/* Behavioral Summary */}
                    {summary && (
                      <div className="mb-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg">
                        <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          AI Behavioral Analysis
                        </h4>

                        <div className="space-y-3 text-sm">
                          {/* Overall Assessment */}
                          <div className="bg-white rounded p-2 border border-indigo-200">
                            <p className="font-semibold text-indigo-900 mb-1">
                              Overall Assessment
                            </p>
                            <p className="text-gray-700 text-xs">
                              {summary.overall_assessment}
                            </p>
                          </div>

                          {/* Strengths */}
                          {summary.strengths &&
                            summary.strengths.length > 0 && (
                              <div className="bg-white rounded p-2 border border-green-200">
                                <p className="font-semibold text-green-900 mb-1">
                                  Strengths
                                </p>
                                <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                                  {summary.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {/* Areas for Improvement */}
                          {summary.areas_for_improvement &&
                            summary.areas_for_improvement.length > 0 && (
                              <div className="bg-white rounded p-2 border border-orange-200">
                                <p className="font-semibold text-orange-900 mb-1">
                                  Areas for Improvement
                                </p>
                                <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                                  {summary.areas_for_improvement.map((a, i) => (
                                    <li key={i}>{a}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {/* Actionable Tips */}
                          {summary.actionable_tips &&
                            summary.actionable_tips.length > 0 && (
                              <div className="bg-white rounded p-2 border border-blue-200">
                                <p className="font-semibold text-blue-900 mb-1">
                                  Actionable Tips
                                </p>
                                <ul className="text-xs text-gray-700 list-decimal list-inside space-y-1">
                                  {summary.actionable_tips.map((t, i) => (
                                    <li key={i}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Answers Section */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">
                        Answers ({session.answers.length})
                      </h4>
                      {session.answers.map((res, ansIdx) => (
                        <Collapsible key={ansIdx} className="w-full">
                          <CollapsibleTrigger className="text-left flex justify-between gap-4 w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-3 transition-colors">
                            <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                              Q{ansIdx + 1}: {res?.question}
                            </span>
                            <div className="flex items-center gap-2">
                              {res?.rating && (
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    parseFloat(res.rating) >= 4
                                      ? "bg-green-200 text-green-900"
                                      : parseFloat(res.rating) >= 3
                                        ? "bg-yellow-200 text-yellow-900"
                                        : "bg-red-200 text-red-900"
                                  }`}
                                >
                                  {res.rating}/5
                                </span>
                              )}
                              <ChevronsUpDown className="h-4 w-4 text-gray-600" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="bg-gray-50 p-4 border-t border-gray-200 space-y-3">
                            {/* Rating */}
                            {res?.rating && (
                              <div className="bg-red-50 border border-red-200 rounded p-2">
                                <p className="text-xs font-semibold text-red-900">
                                  Rating
                                </p>
                                <p className="text-xs text-red-900 mt-1">
                                  {res.rating}/5
                                </p>
                              </div>
                            )}

                            {/* Your Answer */}
                            <div className="bg-red-50 border border-red-200 rounded p-2">
                              <p className="text-xs font-semibold text-red-900">
                                Your Answer
                              </p>
                              <p className="text-xs text-red-900 mt-1 line-clamp-3">
                                {res?.userAns || "No answer provided"}
                              </p>
                            </div>

                            {/* Correct Answer */}
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <p className="text-xs font-semibold text-green-900">
                                Correct Answer
                              </p>
                              <p className="text-xs text-green-900 mt-1 line-clamp-3">
                                {res?.correctAns || "Not available"}
                              </p>
                            </div>

                            {/* AI Feedback */}
                            <div className="bg-blue-50 border border-blue-200 rounded p-2">
                              <p className="text-xs font-semibold text-blue-900">
                                AI Feedback
                              </p>
                              <p className="text-xs text-blue-900 mt-1">
                                {res?.feedback || "No feedback provided"}
                              </p>
                            </div>

                            {/* Behavior Analysis */}
                            {(res?.confidenceScore ||
                              res?.nervousnessScore ||
                              res?.videoUrl) && (
                              <div className="bg-purple-50 border border-purple-200 rounded p-2">
                                <p className="text-xs font-semibold text-purple-900 mb-2">
                                  Behavior Analysis
                                </p>
                                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                                  <span className="text-purple-900">
                                    <strong>Confidence:</strong>{" "}
                                    {res?.confidenceScore ?? "n/a"}
                                  </span>
                                  <span className="text-purple-900">
                                    <strong>Nervousness:</strong>{" "}
                                    {res?.nervousnessScore ?? "n/a"}
                                  </span>
                                  <span className="text-purple-900">
                                    <strong>Level:</strong>{" "}
                                    {res?.nervousnessLevel ?? "n/a"}
                                  </span>
                                </div>
                                {res?.videoUrl && (
                                  <video
                                    src={res.videoUrl}
                                    controls
                                    className="rounded-md max-h-48 w-full mt-2"
                                  />
                                )}
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="w-full p-8 flex justify-center items-center text-gray-500">
            No feedback found
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/dashboard">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default Feedback;
