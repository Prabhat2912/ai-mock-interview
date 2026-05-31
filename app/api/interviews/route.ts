import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { generateJSON } from "@/utils/gemini";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

  const rows = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.createdBy, email))
    .orderBy(desc(MockInterview.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "unknown";

  const { role, description, exp, questionCount } = await req.json();
  if (!role || !description || exp === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const count = Number(questionCount) || 5;
  const prompt = `Job Position: ${role} Job Description: ${description} Years of Experience: ${exp}\nGenerate exactly ${count} interview questions with answers as a JSON array. Each item must be an object with fields "question" and "answer". Respond with JSON only, no prose.`;

  const questions = await generateJSON<{ question: string; answer: string }[]>(prompt);

  const mockId = uuidv4();
  await db.insert(MockInterview).values({
    jsonMockResp: JSON.stringify(questions),
    jobPosition: role,
    jobDescription: description,
    jobExperience: String(exp),
    createdBy: email,
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    mockId,
  });

  return NextResponse.json({ mockId });
}
