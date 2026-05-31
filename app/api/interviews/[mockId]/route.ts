import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mockId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mockId } = await params;
  const rows = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.mockId, mockId));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rows);
}
