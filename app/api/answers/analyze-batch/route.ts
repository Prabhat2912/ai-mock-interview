import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { db } from "@/utils/db";
import { UserAns, InterviewSession } from "@/utils/schema";
import { generateJSON } from "@/utils/gemini";
import moment from "moment";
import type { BehaviorReport } from "@/types/types";

// Allow long-running route (Vercel hobby: 60s; locally Node has no cap).
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type BatchResultItem = {
  id: number;
  ok: boolean;
  report?: BehaviorReport;
  error?: string;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mockId, interviewSessionId } = await req.json();
  if (!mockId)
    return NextResponse.json({ error: "mockId required" }, { status: 400 });

  const backend = process.env.PY_BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "PY_BACKEND_URL not configured" },
      { status: 503 },
    );
  }

  // Filter by session if provided, otherwise use mockId only (backward compatibility)
  const whereConditions = interviewSessionId
    ? and(
        eq(UserAns.mockIdRef, mockId),
        eq(UserAns.interviewSessionId, interviewSessionId),
        isNotNull(UserAns.videoUrl),
        isNull(UserAns.behaviorJson),
      )
    : and(
        eq(UserAns.mockIdRef, mockId),
        isNotNull(UserAns.videoUrl),
        isNull(UserAns.behaviorJson),
      );

  const rows = await db
    .select({ id: UserAns.id, videoUrl: UserAns.videoUrl })
    .from(UserAns)
    .where(whereConditions);

  const items = rows
    .filter((r) => !!r.videoUrl)
    .map((r) => ({ id: r.id, video_url: r.videoUrl as string }));

  if (items.length === 0) {
    return NextResponse.json({
      ok: true,
      analyzed: 0,
      message: "Nothing to analyze",
    });
  }

  let payload: { results: BatchResultItem[] };
  try {
    const res = await fetch(
      `${backend.replace(/\/$/, "")}/analyze-behavior-batch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("Batch backend error", res.status, text);
      return NextResponse.json(
        { error: "Backend error", detail: text },
        { status: 502 },
      );
    }
    payload = (await res.json()) as { results: BatchResultItem[] };
  } catch (err) {
    console.error("Batch backend unreachable", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  let updated = 0;
  const behaviorReports: BehaviorReport[] = [];

  for (const r of payload.results || []) {
    if (!r.ok || !r.report) continue;
    await db
      .update(UserAns)
      .set({
        confidenceScore: String(r.report.confidence_score),
        nervousnessScore: String(r.report.nervousness_score),
        nervousnessLevel: r.report.nervousness_level,
        behaviorJson: JSON.stringify(r.report),
      })
      .where(eq(UserAns.id, r.id));
    updated += 1;
    behaviorReports.push(r.report);
  }

  // Generate behavioral summary using Gemini if we have reports
  let behavioralSummary = "";
  let overallNervousnessLevel = "Not Available";
  let overallConfidenceScore = "0";

  if (behaviorReports.length > 0) {
    try {
      // Calculate averages
      const avgConfidence =
        behaviorReports.reduce((sum, r) => sum + r.confidence_score, 0) /
        behaviorReports.length;
      const avgNervousness =
        behaviorReports.reduce((sum, r) => sum + r.nervousness_score, 0) /
        behaviorReports.length;

      // Get most common nervousness level
      const nervousnessLevels = behaviorReports.map((r) => r.nervousness_level);
      overallNervousnessLevel =
        nervousnessLevels
          .sort(
            (a, b) =>
              nervousnessLevels.filter((v) => v === a).length -
              nervousnessLevels.filter((v) => v === b).length,
          )
          .pop() || "Medium";

      overallConfidenceScore = avgConfidence.toFixed(2);

      // Build a summary prompt for Gemini
      const audioSummaries = behaviorReports.map((r) => ({
        wpm: r.audio_summary?.estimated_wpm || 0,
        jitter: r.audio_summary?.jitter || 0,
        shimmer: r.audio_summary?.shimmer || 0,
        pauseDuration: r.audio_summary?.pause_duration_sec || 0,
        speechRatio: r.audio_summary?.speech_ratio || 0,
      }));

      const summaryPrompt = `You are an expert interview coach. Analyze these behavioral metrics from a mock interview and provide constructive feedback:

Average Confidence Score: ${avgConfidence.toFixed(2)}
Average Nervousness Score: ${avgNervousness.toFixed(2)}
Overall Nervousness Level: ${overallNervousnessLevel}

Audio Metrics (averages):
- Estimated WPM: ${(audioSummaries.reduce((s, a) => s + a.wpm, 0) / audioSummaries.length).toFixed(0)}
- Jitter (vocal instability): ${(audioSummaries.reduce((s, a) => s + a.jitter, 0) / audioSummaries.length).toFixed(3)}
- Shimmer (vocal quality): ${(audioSummaries.reduce((s, a) => s + a.shimmer, 0) / audioSummaries.length).toFixed(3)}
- Pause Duration (sec): ${(audioSummaries.reduce((s, a) => s + a.pauseDuration, 0) / audioSummaries.length).toFixed(2)}
- Speech Ratio: ${(audioSummaries.reduce((s, a) => s + a.speechRatio, 0) / audioSummaries.length).toFixed(2)}

Provide a JSON response with:
1. "overall_assessment": A 2-3 line summary of the interview performance
2. "strengths": Array of 2-3 key strengths observed
3. "areas_for_improvement": Array of 2-3 areas to work on
4. "actionable_tips": Array of 3-4 specific tips to improve performance`;

      const summary = await generateJSON<{
        overall_assessment: string;
        strengths: string[];
        areas_for_improvement: string[];
        actionable_tips: string[];
      }>(summaryPrompt);

      behavioralSummary = JSON.stringify(summary);
    } catch (err) {
      console.error("Gemini behavioral summary failed", err);
      behavioralSummary = JSON.stringify({
        overall_assessment:
          "Analysis completed. Review individual feedback for details.",
        strengths: ["Video analysis completed"],
        areas_for_improvement: [],
        actionable_tips: [],
      });
    }
  }

  // Create or update interview session record if we have a session ID
  if (interviewSessionId) {
    try {
      const existingSession = await db
        .select()
        .from(InterviewSession)
        .where(eq(InterviewSession.sessionId, interviewSessionId));

      if (existingSession.length === 0) {
        // Get user email from first record
        const firstRecord = await db
          .select({ userEmail: UserAns.userEmail })
          .from(UserAns)
          .where(eq(UserAns.interviewSessionId, interviewSessionId))
          .limit(1);

        if (firstRecord.length > 0) {
          await db.insert(InterviewSession).values({
            sessionId: interviewSessionId,
            mockIdRef: mockId,
            userEmail: firstRecord[0].userEmail || "",
            startedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            endedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            behavioralSummary,
            overallNervousnessLevel,
            overallConfidenceScore,
          });
        }
      } else {
        // Update existing session
        await db
          .update(InterviewSession)
          .set({
            endedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            behavioralSummary,
            overallNervousnessLevel,
            overallConfidenceScore,
          })
          .where(eq(InterviewSession.sessionId, interviewSessionId));
      }
    } catch (err) {
      console.error("Failed to create/update interview session", err);
    }
  }

  return NextResponse.json({
    ok: true,
    analyzed: updated,
    total: items.length,
    behavioralSummary,
    overallNervousnessLevel,
    overallConfidenceScore,
  });
}
