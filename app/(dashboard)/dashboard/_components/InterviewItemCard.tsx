import { Button } from "@/components/ui/button";
import { jobResponse } from "@/types/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

function InterviewItemCard({ interview }: { interview: jobResponse }) {
  const catalogNo = (interview?.mockId || "").slice(-4).toUpperCase() || "—";
  let cueCount: number | null = null;
  try {
    const parsed = JSON.parse(interview?.jsonMockResp || "null");
    if (Array.isArray(parsed)) cueCount = parsed.length;
  } catch {
    cueCount = null;
  }

  return (
    <li className="grid gap-3 border-t border-stage/20 py-5 last:border-b sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
      <span className="tnum font-display text-lg font-semibold tracking-[0.12em] text-tungsten">
        N-{catalogNo}
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-display text-2xl font-semibold uppercase leading-none tracking-wide">
          {interview?.jobPosition}
        </h3>
        <p className="tnum mt-1.5 text-sm font-medium text-tungsten">
          {interview?.jobExperience} yrs
          <span aria-hidden> · </span>
          {interview.createdAt
            ? new Date(interview.createdAt).toLocaleDateString()
            : "undated"}
          {cueCount !== null && (
            <>
              <span aria-hidden> · </span>
              {cueCount} {cueCount === 1 ? "cue" : "cues"}
            </>
          )}
        </p>
        <p className="mt-1 line-clamp-1 text-sm text-tungsten">
          {interview?.jobDescription}
        </p>
      </div>
      <div className="flex gap-2.5">
        <Link
          prefetch
          href={`/dashboard/interview/${interview?.mockId}/feedback`}
        >
          <Button
            size="sm"
            variant="outline"
            className="rounded-none border-stage/40 font-bold uppercase tracking-[0.08em] text-stage hover:bg-paper-deep"
          >
            Reviews
          </Button>
        </Link>
        <Link prefetch href={`/dashboard/interview/${interview?.mockId}`}>
          <Button
            size="sm"
            className="rounded-none bg-stage font-bold uppercase tracking-[0.08em] text-paper hover:bg-stage-soft"
          >
            Rehearse
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </Link>
      </div>
    </li>
  );
}

export default InterviewItemCard;
