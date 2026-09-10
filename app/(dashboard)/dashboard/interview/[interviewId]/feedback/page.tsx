"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Params } from "next/dist/server/request/params";
import { InterviewFeedback } from "@/types/types";
import {
  ArrowLeft,
  CircleAlert,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [behaviorFailed, setBehaviorFailed] = useState(false);
  const [hasVideoAnswers, setHasVideoAnswers] = useState(true);
  const [retrying, setRetrying] = useState(false);
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
      try {
        await fetch("/api/answers/assign-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mockId: resolvedParams.interviewId }),
        }).catch(() => {});
      } catch {}

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
      const failed = data.some((session) =>
        session.answers.some(
          (r) =>
            r.videoUrl &&
            !r.confidenceScore &&
            !!r.behaviorJson &&
            r.behaviorJson.includes('"error"'),
        ),
      );
      setBehaviorFailed(failed);
      // If answers exist but none have a video, behavior analysis can never
      // run (nothing was recorded/uploaded). Tell the user instead of
      // showing a mysteriously empty behavior section.
      const anyVideo = data.some((session) =>
        session.answers.some((r) => !!r.videoUrl),
      );
      const anyAnswers = data.some(
        (session) => session.answers && session.answers.length > 0,
      );
      setHasVideoAnswers(!anyAnswers || anyVideo);
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

  useEffect(() => {
    if (!behaviorPending) return;
    const id = setInterval(() => {
      getResults();
    }, 15000);
    return () => clearInterval(id);
  }, [behaviorPending, resolvedParams]);

  const retryAnalysis = async () => {
    if (
      !resolvedParams?.interviewId ||
      typeof resolvedParams.interviewId !== "string"
    )
      return;
    setRetrying(true);
    try {
      const needsWork = (r: InterviewFeedback) =>
        r.videoUrl &&
        !r.confidenceScore &&
        (!r.behaviorJson || r.behaviorJson.includes('"error"'));
      const targetSessions = (sessions || []).filter((s) =>
        s.answers.some(needsWork),
      );
      const targets =
        targetSessions.length > 0 ? targetSessions : [{ sessionId: "" }];
      await Promise.all(
        targets.map((s) =>
          fetch("/api/answers/analyze-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mockId: resolvedParams.interviewId,
              interviewSessionId: (s as SessionData).sessionId || undefined,
            }),
          }).catch(() => null),
        ),
      );
      await getResults();
    } finally {
      setRetrying(false);
    }
  };

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
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const avgNervousness = (answers: InterviewFeedback[]) => {
    const vals = (answers || [])
      .map((r) => parseFloat(r.nervousnessScore || ""))
      .filter((n) => !Number.isNaN(n));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
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

  const allAnswers = (sessions || []).flatMap((s) => s.answers);
  const overallAvg = allAnswers.length
    ? (
        allAnswers.reduce((a, c) => a + parseFloat(c.rating || "0"), 0) /
        allAnswers.length
      ).toFixed(1)
    : null;

  return (
    <div className="py-8">
      <div className="flex flex-col gap-4 bg-stage px-6 py-7 text-paper sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
          Session report
        </h1>
        {overallAvg && (
          <p className="stamp rotate-[-4deg] border-marquee-bright text-marquee-bright">
            <span className="tnum">{overallAvg} / 5</span>
          </p>
        )}
      </div>

      {!loading && !hasVideoAnswers && (
        <div className="mt-3 p-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            No recorded videos found for this interview, so there&apos;s
            nothing for behavior analysis. To get confidence/nervousness
            scores, allow camera + microphone on the start page, record your
            answer, and make sure you see the &quot;Answer saved&quot; toast
            before ending the interview.
          </span>
        </div>
      )}

      {behaviorPending && (
        <div className="mt-4 flex items-center gap-3 border border-marquee-deep/50 bg-marquee/10 p-4 text-sm">
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 animate-lamp rounded-full bg-marquee" />
          <span className="flex-1 font-medium">
            Presence readings are still developing backstage. This page
            refreshes itself when they land.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-none border-stage/40 font-bold uppercase tracking-[0.08em]"
            disabled={retrying}
            onClick={retryAnalysis}
          >
            {retrying ? "Retrying…" : "Retry now"}
          </Button>
        </div>
      )}

      {!behaviorPending && behaviorFailed && (
        <div className="mt-4 flex items-center gap-3 border border-[#A4262C]/40 bg-[#A4262C]/5 p-4 text-sm">
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1 font-medium">
            Some presence readings never developed — the clip may be too
            large, faceless, or the room was waking up.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-none border-stage/40 font-bold uppercase tracking-[0.08em]"
            disabled={retrying}
            onClick={retryAnalysis}
          >
            {retrying ? "Retrying…" : "Retry readings"}
          </Button>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {loading ? (
          <div className="flex flex-col gap-4" aria-label="Loading report">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-[120px] animate-pulse border border-stage/15 bg-paper-deep/50"
              />
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session, sessionIdx) => {
            const summary = parseBehavioralSummary(
              session.sessionInfo?.behavioralSummary ?? null,
            );
            const open =
              expandedSessions.has(session.sessionId) ||
              (sessionIdx === 0 && expandedSessions.size === 0);

            return (
              <article
                key={session.sessionId}
                className="border border-stage/25 bg-paper"
              >
                <button
                  onClick={() => toggleSession(session.sessionId)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-paper-deep/40 sm:px-6"
                >
                  <span className="tnum font-display text-lg font-semibold tracking-[0.12em] text-tungsten">
                    N-{(session.sessionId || "").slice(-4).toUpperCase() || "—"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-2xl font-semibold uppercase leading-none tracking-wide">
                      Performance {sessionIdx + 1}
                    </span>
                    {session.sessionInfo && (
                      <span className="tnum mt-1 block text-xs font-medium text-tungsten">
                        {formatDate(session.sessionInfo.startedAt)}
                        <span aria-hidden> · </span>
                        {session.answers.length}{" "}
                        {session.answers.length === 1 ? "take" : "takes"}
                        {avgConfidence(session.answers) !== null && (
                          <>
                            <span aria-hidden> · </span>
                            presence {avgConfidence(session.answers)}
                          </>
                        )}
                        {avgNervousness(session.answers) !== null && (
                          <>
                            <span aria-hidden> · </span>
                            nerves {avgNervousness(session.answers)}
                          </>
                        )}
                      </span>
                    )}
                  </span>
                  <span className="stamp hidden !text-base sm:inline-grid">
                    <span className="tnum">{getAvgRating(session.answers)} / 5</span>
                  </span>
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <div className="border-t border-stage/20 bg-paper-deep/30 px-5 py-5 sm:px-6">
                    {summary && (
                      <div className="mb-5 bg-stage p-5 text-paper sm:p-6">
                        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-marquee-bright">
                          The presence notes
                        </h3>
                        <p className="mt-2 max-w-3xl leading-relaxed text-paper/85">
                          {summary.overall_assessment}
                        </p>
                        <div className="mt-4 grid gap-5 md:grid-cols-3">
                          {summary.strengths?.length > 0 && (
                            <div>
                              <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-paper/65">
                                Held the room
                              </h4>
                              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-paper/80">
                                {summary.strengths.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {summary.areas_for_improvement?.length > 0 && (
                            <div>
                              <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-paper/65">
                                Work the edges
                              </h4>
                              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-paper/80">
                                {summary.areas_for_improvement.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {summary.actionable_tips?.length > 0 && (
                            <div>
                              <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-paper/65">
                                Before next time
                              </h4>
                              <ul className="mt-2 list-decimal space-y-1 pl-4 text-sm leading-relaxed text-paper/80">
                                {summary.actionable_tips.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <ol className="space-y-3">
                      {session.answers.map((res, ansIdx) => (
                        <li key={ansIdx}>
                          <Collapsible className="border border-stage/25 bg-paper">
                            <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper-deep/40">
                              <span className="tnum grid h-8 w-8 shrink-0 place-items-center bg-stage font-display text-sm font-semibold text-paper">
                                {ansIdx + 1}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[15px] font-bold">
                                {res?.question}
                              </span>
                              {res?.rating && (
                                <span className="tnum shrink-0 border border-stage/30 px-2 py-0.5 text-xs font-bold">
                                  {res.rating}/5
                                </span>
                              )}
                              <ChevronsUpDown className="h-4 w-4 shrink-0 text-tungsten" aria-hidden />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4 border-t border-stage/20 p-4 sm:p-5">
                              <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                  <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
                                    Your take
                                  </h4>
                                  <p className="mt-1.5 text-sm leading-relaxed">
                                    {res?.userAns || "No answer recorded."}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
                                    The model take
                                  </h4>
                                  <p className="mt-1.5 text-sm leading-relaxed">
                                    {res?.correctAns || "Not available."}
                                  </p>
                                </div>
                              </div>
                              <div className="border-t border-stage/20 pt-4">
                                <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
                                  The note
                                </h4>
                                <p className="mt-1.5 text-[15px] font-medium leading-relaxed">
                                  {res?.feedback || "No note written."}
                                </p>
                              </div>
                              {(res?.confidenceScore ||
                                res?.nervousnessScore ||
                                res?.videoUrl) && (
                                <div className="border-t border-stage/20 pt-4">
                                  <h4 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
                                    Presence
                                  </h4>
                                  <p className="tnum mt-1.5 text-sm font-bold">
                                    Confidence {res?.confidenceScore ?? "—"}
                                    <span aria-hidden> · </span>
                                    Nerves {res?.nervousnessScore ?? "—"}
                                    <span aria-hidden> · </span>
                                    {res?.nervousnessLevel ?? "unrated"}
                                  </p>
                                  {res?.videoUrl && (
                                    <video
                                      src={res.videoUrl}
                                      controls
                                      className="mt-3 max-h-52 w-full bg-stage"
                                    />
                                  )}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="border border-dashed border-stage/40 px-6 py-14 text-center">
            <p className="font-display text-2xl font-semibold uppercase tracking-wide">
              No reviews yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tungsten">
              Record at least one take in the session and the report is
              written here.
            </p>
            {resolvedParams?.interviewId && (
              <Link
                href={`/dashboard/interview/${resolvedParams.interviewId}/start`}
                className="btn-marquee mt-5 rounded-none"
              >
                Back to the session
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="w-full rounded-none border-stage/40 font-bold uppercase tracking-[0.08em] text-stage hover:bg-paper-deep sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Callboard
          </Button>
        </Link>
        {resolvedParams?.interviewId && typeof resolvedParams.interviewId === "string" && (
          <Link href={`/dashboard/interview/${resolvedParams.interviewId}/start`}>
            <Button
              variant="outline"
              className="w-full rounded-none border-stage/40 font-bold uppercase tracking-[0.08em] text-stage hover:bg-paper-deep sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" aria-hidden /> Run it again
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Feedback;
