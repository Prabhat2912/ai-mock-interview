import { serial, text, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const MockInterview = pgTable("mockInterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDescription: varchar("jobDescription").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt"),
  mockId: varchar("mockId").notNull(),
});
export const UserAns = pgTable("userAns", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),
  interviewSessionId: varchar("interviewSessionId"),
  question: varchar("question").notNull(),
  correctAns: varchar("correctAns").notNull(),
  userAns: text("userAns"),
  feedback: text("feedback"),
  rating: varchar("rating"),
  userEmail: varchar("userEmail"),
  createdAt: varchar("createdAt"),
  videoUrl: text("videoUrl"),
  confidenceScore: varchar("confidenceScore"),
  nervousnessScore: varchar("nervousnessScore"),
  nervousnessLevel: varchar("nervousnessLevel"),
  behaviorJson: text("behaviorJson"),
});

export const InterviewSession = pgTable("interviewSession", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId").notNull().unique(),
  mockIdRef: varchar("mockId").notNull(),
  userEmail: varchar("userEmail").notNull(),
  startedAt: varchar("startedAt").notNull(),
  endedAt: varchar("endedAt"),
  behavioralSummary: text("behavioralSummary"),
  overallNervousnessLevel: varchar("overallNervousnessLevel"),
  overallConfidenceScore: varchar("overallConfidenceScore"),
});
