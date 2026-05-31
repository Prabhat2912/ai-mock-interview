import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, isNull, or } from "drizzle-orm";
import { db } from "@/utils/db";
import { UserAns, InterviewSession } from "@/utils/schema";
import moment from "moment";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mockId } = await req.json();
  if (!mockId)
    return NextResponse.json({ error: "mockId required" }, { status: 400 });

  try {
    // Find answers without a session ID (null or empty)
    const answersWithoutSession = await db
      .select()
      .from(UserAns)
      .where(
        eq(UserAns.mockIdRef, mockId) &&
          or(
            isNull(UserAns.interviewSessionId),
            eq(UserAns.interviewSessionId, ""),
          ),
      );

    if (answersWithoutSession.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No answers without session IDs found",
        assigned: 0,
      });
    }

    // Generate a random session ID for these old answers
    const randomSessionId = `legacy_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Update all answers without session ID to have this new session ID
    await db
      .update(UserAns)
      .set({ interviewSessionId: randomSessionId })
      .where(
        eq(UserAns.mockIdRef, mockId) &&
          or(
            isNull(UserAns.interviewSessionId),
            eq(UserAns.interviewSessionId, ""),
          ),
      );

    // Get user email from first answer
    const userEmail = answersWithoutSession[0]?.userEmail || "";

    // Create an InterviewSession record for these legacy answers
    const existingSession = await db
      .select()
      .from(InterviewSession)
      .where(eq(InterviewSession.sessionId, randomSessionId));

    if (existingSession.length === 0) {
      await db.insert(InterviewSession).values({
        sessionId: randomSessionId,
        mockIdRef: mockId,
        userEmail,
        startedAt:
          answersWithoutSession[0]?.createdAt ||
          moment().format("YYYY-MM-DD HH:mm:ss"),
        endedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        behavioralSummary: JSON.stringify({
          overall_assessment:
            "This is a previous interview session recorded before behavioral analysis was enabled.",
          strengths: [],
          areas_for_improvement: [],
          actionable_tips: [
            "Re-take the interview to get detailed behavioral analysis and AI-powered feedback.",
          ],
        }),
        overallNervousnessLevel: "Not Available",
        overallConfidenceScore: "0",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Session IDs assigned to legacy answers",
      assigned: answersWithoutSession.length,
      sessionId: randomSessionId,
    });
  } catch (error) {
    console.error("Error assigning session IDs:", error);
    return NextResponse.json(
      { error: "Failed to assign session IDs", detail: String(error) },
      { status: 500 },
    );
  }
}
