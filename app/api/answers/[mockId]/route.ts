import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { UserAns, InterviewSession } from "@/utils/schema";

interface SessionGrouped {
  sessionId: string;
  sessionInfo?: {
    startedAt: string;
    endedAt: string | null;
    behavioralSummary: string | null;
    overallNervousnessLevel: string | null;
    overallConfidenceScore: string | null;
  };
  answers: (typeof UserAns.$inferSelect)[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mockId: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mockId } = await params;

  try {
    const rows = await db
      .select()
      .from(UserAns)
      .where(eq(UserAns.mockIdRef, mockId))
      .orderBy(asc(UserAns.interviewSessionId));

    // Group by session
    const groupedBySession = new Map<string, (typeof UserAns.$inferSelect)[]>();
    for (const row of rows) {
      const sessionId = row.interviewSessionId || "default";
      if (!groupedBySession.has(sessionId)) {
        groupedBySession.set(sessionId, []);
      }
      groupedBySession.get(sessionId)!.push(row);
    }

    // Fetch session info for each session
    const result: SessionGrouped[] = [];
    for (const [sessionId, answers] of groupedBySession.entries()) {
      let sessionInfo = undefined;

      if (sessionId !== "default") {
        const sessions = await db
          .select()
          .from(InterviewSession)
          .where(eq(InterviewSession.sessionId, sessionId));

        if (sessions.length > 0) {
          const session = sessions[0];
          sessionInfo = {
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            behavioralSummary: session.behavioralSummary,
            overallNervousnessLevel: session.overallNervousnessLevel,
            overallConfidenceScore: session.overallConfidenceScore,
          };
        }
      }

      result.push({
        sessionId,
        sessionInfo,
        answers: answers.sort((a, b) => (a.id || 0) - (b.id || 0)),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching grouped answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 },
    );
  }
}
