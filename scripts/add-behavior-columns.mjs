// One-off migration: add behavior columns without touching legacy columns.
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const url = process.env.DRIZZLE_DB_URL;
if (!url) throw new Error("DRIZZLE_DB_URL not set");

const sql = neon(url);

const statements = [
  `ALTER TABLE "userAns" ADD COLUMN IF NOT EXISTS "videoUrl" text`,
  `ALTER TABLE "userAns" ADD COLUMN IF NOT EXISTS "confidenceScore" varchar`,
  `ALTER TABLE "userAns" ADD COLUMN IF NOT EXISTS "nervousnessScore" varchar`,
  `ALTER TABLE "userAns" ADD COLUMN IF NOT EXISTS "nervousnessLevel" varchar`,
  `ALTER TABLE "userAns" ADD COLUMN IF NOT EXISTS "behaviorJson" text`,
];

for (const s of statements) {
  console.log(">", s);
  await sql(s);
}
console.log("Done.");
