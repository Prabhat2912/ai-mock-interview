export interface navLinks {
  id: number;
  name: string;
  path: string;
}

export interface InterviewFeedback {
  correctAns: string;
  createdAt: string;
  feedback: string;
  id: number;
  mockIdRef: string;
  question: string;
  rating: string;
  userAns: string;
  userEmail: string;
  videoUrl?: string | null;
  confidenceScore?: string | null;
  nervousnessScore?: string | null;
  nervousnessLevel?: string | null;
  behaviorJson?: string | null;
}

export interface BehaviorReport {
  confidence_score: number;
  nervousness_score: number;
  nervousness_level: string;
  stress_events: { timestamp: number; reason: string; intensity: number }[];
  visual_summary: Record<string, unknown>;
  audio_summary: Record<string, unknown>;
}
export interface jobResponse {
  createdAt: string | null;
  id: number;
  jobDescription: string;
  mockId: string;
  createdBy: string;
  jobPosition: string;
  jsonMockResp: string;
  jobExperience: string;
}
export interface mockInterviewQuestionsRes {
  question: string;
  answer: string;
}
export interface planDataType {
  id: number;
  name: string;
  cost: number;
  offering: {
    value: string;
  }[];
  paymentLink?: string;
}
