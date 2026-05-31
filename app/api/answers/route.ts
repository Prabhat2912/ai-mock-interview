import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import moment from "moment";
import { db } from "@/utils/db";
import { UserAns } from "@/utils/schema";
import { generateJSON } from "@/utils/gemini";
import type { BehaviorReport } from "@/types/types";

async function analyzeBehavior(videoUrl: string): Promise<BehaviorReport | null> {
  const backend = process.env.PY_BACKEND_URL;
  if (!backend) return null;
  try {
    const res = await fetch(`${backend.replace(/\/$/, "")}/analyze-behavior`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url: videoUrl }),
    });
    if (!res.ok) {
      console.error("Behavior backend error", res.status, await res.text());
      return null;
    }
    return (await res.json()) as BehaviorReport;
  } catch (err) {
    console.error("Behavior backend unreachable", err);
    return null;
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";

  const { mockId, question, correctAns, userAns, videoUrl } = await req.json();
  if (!mockId || !question || !userAns) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const feedbackPrompt = `Question: ${question}\nUser Answer: ${userAns}\nBased on the question and the user's answer, return JSON ONLY with fields "rating" (a number 1-5 as a string) and "feedback" (3-5 lines describing areas of improvement).`;
  const gemini = await generateJSON<{ rating: string; feedback: string }>(feedbackPrompt);

  let behavior: BehaviorReport | null = null;
  if (videoUrl) {
    behavior = await analyzeBehavior(videoUrl);
  }

  await db.insert(UserAns).values({
    mockIdRef: mockId,
    question,
    correctAns: correctAns || "",
    userAns,
    feedback: gemini.feedback,
    rating: String(gemini.rating),
    userEmail: email,
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    videoUrl: videoUrl || null,
    confidenceScore: behavior ? String(behavior.confidence_score) : null,
    nervousnessScore: behavior ? String(behavior.nervousness_score) : null,
    nervousnessLevel: behavior ? behavior.nervousness_level : null,
    behaviorJson: behavior ? JSON.stringify(behavior) : null,
  });

  return NextResponse.json({ ok: true, gemini, behavior });
}
