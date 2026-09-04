import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import moment from "moment";
import { db } from "@/utils/db";
import { UserAns } from "@/utils/schema";
import { generateJSON } from "@/utils/gemini";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";

  const {
    mockId,
    interviewSessionId,
    question,
    correctAns,
    userAns,
    videoUrl,
  } = await req.json();
  if (!mockId || !question || !userAns) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const feedbackPrompt = `Question: ${question}\nUser Answer: ${userAns}\nBased on the question and the user's answer, return JSON ONLY with fields "rating" (a number 1-5 as a string) and "feedback" (3-5 lines describing areas of improvement).`;

  let gemini: { rating: string; feedback: string };
  try {
    gemini = await generateJSON<{ rating: string; feedback: string }>(
      feedbackPrompt,
    );
  } catch (err) {
    console.error("Gemini feedback failed", err);
    gemini = { rating: "0", feedback: "AI feedback unavailable." };
  }

  await db.insert(UserAns).values({
    mockIdRef: mockId,
    interviewSessionId: interviewSessionId || null,
    question,
    correctAns: correctAns || "",
    userAns,
    feedback: gemini.feedback,
    rating: String(gemini.rating),
    userEmail: email,
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    videoUrl: videoUrl || null,
    confidenceScore: null,
    nervousnessScore: null,
    nervousnessLevel: null,
    behaviorJson: null,
  });

  return NextResponse.json({ ok: true, gemini });
}
