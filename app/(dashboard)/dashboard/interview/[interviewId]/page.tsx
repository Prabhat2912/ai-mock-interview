"use client";
import { Button } from "@/components/ui/button";
import { jobResponse } from "@/types/types";
import { ArrowLeft, ArrowRight, Camera, ClipboardList } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

interface Params {
  interviewId: string;
}

const Interview = ({ params }: { params: Promise<Params> }) => {
  const [resolvedParams, setResolvedParams] = useState<Params | null>(null);
  const [camEnabled, setCamEnabled] = useState(false);
  const [interviewData, setInterviewData] = useState<jobResponse[]>([]);

  useEffect(() => {
    params.then((data) => setResolvedParams(data));
  }, [params]);

  useEffect(() => {
    const getInterviewDetails = async () => {
      if (!resolvedParams?.interviewId) return;
      const res = await fetch(`/api/interviews/${resolvedParams.interviewId}`);
      if (res.ok) {
        const data = (await res.json()) as jobResponse[];
        setInterviewData(data);
      }
    };
    getInterviewDetails();
  }, [resolvedParams]);

  return (
    <div className="py-8">
      <div className="bg-stage px-6 py-7 text-paper sm:px-8">
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
          {interviewData?.[0]?.jobPosition || "Reading the sheet…"}
        </h1>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-paper/60 transition-colors hover:text-paper"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to the callboard
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-stage/25 bg-paper p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide">
            <ClipboardList className="h-5 w-5" aria-hidden /> The brief
          </h2>
          <dl className="mt-4 space-y-4 text-[15px]">
            <div className="border-t border-stage/20 pt-3">
              <dt className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
                Description
              </dt>
              <dd className="mt-1 leading-relaxed">
                {interviewData?.[0]?.jobDescription || "Reading…"}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-stage/20 pt-3">
              <dt className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-tungsten">
                Experience
              </dt>
              <dd className="tnum bg-stage px-3 py-1 text-sm font-bold text-paper">
                {interviewData?.[0]?.jobExperience || "—"} yrs
              </dd>
            </div>
          </dl>
          <div className="mt-5 bg-paper-deep/60 p-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em]">
              House rules
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-stage/80">
              <li>Answer out loud — speech is transcribed live.</li>
              <li>Keep each answer under a minute so it can be scored.</li>
              <li>{process.env.NEXT_PUBLIC_INFORMATION || "Be clear, structured, and specific."}</li>
            </ul>
          </div>
        </div>

        <div className="border border-stage/25 bg-paper">
          <div className="flex items-center justify-between border-b border-stage/20 px-6 py-4">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide">
              <Camera className="h-5 w-5" aria-hidden /> Camera and mic
            </h2>
            <p
              role="status"
              className={`font-display text-xs font-semibold uppercase tracking-[0.2em] ${camEnabled ? "text-stage" : "text-tungsten"}`}
            >
              {camEnabled ? "Ready" : "Off"}
            </p>
          </div>
          <div className="p-6">
            {camEnabled ? (
              <div className="bg-stage">
                <Webcam
                  audio={true}
                  mirrored={true}
                  onUserMedia={() => setCamEnabled(true)}
                  onUserMediaError={() => setCamEnabled(false)}
                  style={{ height: 320, width: "100%", objectFit: "cover" }}
                />
              </div>
            ) : (
              <div className="border border-dashed border-stage/40 px-6 py-12 text-center">
                <p className="font-display text-xl font-semibold uppercase tracking-wide">
                  The stage is dark
                </p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-tungsten">
                  Switch on your camera and microphone to rehearse with full
                  presence readings.
                </p>
                <Button
                  className="mt-4 rounded-none border border-stage/40 font-bold uppercase tracking-[0.08em]"
                  variant="outline"
                  onClick={() => setCamEnabled(true)}
                >
                  Switch on
                </Button>
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-tungsten">
              Video stays inside your session and is used only for your own
              feedback report.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="w-full rounded-none font-bold uppercase tracking-[0.08em] text-stage hover:bg-paper-deep sm:w-auto"
          >
            Not yet
          </Button>
        </Link>
        <Link href={`/dashboard/interview/${resolvedParams?.interviewId}/start`}>
          <Button className="btn-marquee w-full rounded-none sm:w-auto">
            Places — begin
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Interview;
