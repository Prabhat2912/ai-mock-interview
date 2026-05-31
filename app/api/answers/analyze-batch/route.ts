import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { db } from "@/utils/db";
import { UserAns } from "@/utils/schema";
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
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mockId } = await req.json();
  if (!mockId) return NextResponse.json({ error: "mockId required" }, { status: 400 });

  const backend = process.env.PY_BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { error: "PY_BACKEND_URL not configured" },
      { status: 503 }
    );
  }

  const rows = await db
    .select({ id: UserAns.id, videoUrl: UserAns.videoUrl })
    .from(UserAns)
    .where(
      and(
        eq(UserAns.mockIdRef, mockId),
        isNotNull(UserAns.videoUrl),
        isNull(UserAns.behaviorJson)
      )
    );

  const items = rows
    .filter((r) => !!r.videoUrl)
    .map((r) => ({ id: r.id, video_url: r.videoUrl as string }));

  if (items.length === 0) {
    return NextResponse.json({ ok: true, analyzed: 0, message: "Nothing to analyze" });
  }

  let payload: { results: BatchResultItem[] };
  try {
    const res = await fetch(`${backend.replace(/\/$/, "")}/analyze-behavior-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Batch backend error", res.status, text);
      return NextResponse.json({ error: "Backend error", detail: text }, { status: 502 });
    }
    payload = (await res.json()) as { results: BatchResultItem[] };
  } catch (err) {
    console.error("Batch backend unreachable", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  let updated = 0;
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
  }

  return NextResponse.json({ ok: true, analyzed: updated, total: items.length });
}
