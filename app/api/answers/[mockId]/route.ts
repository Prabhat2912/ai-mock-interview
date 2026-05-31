import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { UserAns } from "@/utils/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mockId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mockId } = await params;
  const rows = await db
    .select()
    .from(UserAns)
    .where(eq(UserAns.mockIdRef, mockId))
    .orderBy(asc(UserAns.id));

  return NextResponse.json(rows);
}
