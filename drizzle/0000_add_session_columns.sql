-- Add interviewSessionId column to existing userAns table
ALTER TABLE "userAns" 
ADD COLUMN "interviewSessionId" varchar DEFAULT 'default';

-- Make the column NOT NULL after setting defaults
ALTER TABLE "userAns" 
ALTER COLUMN "interviewSessionId" SET NOT NULL;

-- Create interviewSession table if it doesn't exist
CREATE TABLE IF NOT EXISTS "interviewSession" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar NOT NULL,
	"mockId" varchar NOT NULL,
	"userEmail" varchar NOT NULL,
	"startedAt" varchar NOT NULL,
	"endedAt" varchar,
	"behavioralSummary" text,
	"overallNervousnessLevel" varchar,
	"overallConfidenceScore" varchar,
	CONSTRAINT "interviewSession_sessionId_unique" UNIQUE("sessionId")
);
