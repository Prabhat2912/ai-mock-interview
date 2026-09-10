"use client";
import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const CUES = [
  "Tell me about yourself.",
  "How do you tame a React app that re-renders too often?",
  "Describe a conflict you resolved on your team.",
  "What happens between typing a URL and the page appearing?",
  "Where do you want to be in three years?",
];

const SAMPLE_TRANSCRIPT =
  "We profiled first, memoized the hot paths, virtualized the long list, and cut re-renders by two thirds.";

const SAMPLE_COACH =
  "Name the profiler by name and the story earns full marks.";

/**
 * Tonight's setlist: a labeled sample of the rehearsal mechanism.
 * Plays one cue: lamp lights, transcript types out, scorecard stamps in.
 */
const SetlistBoard = () => {
  const [now, setNow] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState("");
  const [stamped, setStamped] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };

  useEffect(() => stop, []);

  const play = () => {
    stop();
    setNow(1);
    setTyped("");
    setStamped(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(SAMPLE_TRANSCRIPT);
      setStamped(true);
      return;
    }
    setPlaying(true);
    let i = 0;
    timer.current = setInterval(() => {
      i += 3;
      setTyped(SAMPLE_TRANSCRIPT.slice(0, i));
      if (i >= SAMPLE_TRANSCRIPT.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setPlaying(false);
        setStamped(true);
      }
    }, 24);
  };

  const reset = () => {
    stop();
    setTyped("");
    setStamped(false);
  };

  return (
    <div className="border border-stage-line bg-stage-soft">
      <div className="flex items-center justify-between border-b border-stage-line px-5 py-3">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-paper/60">
          Tonight&apos;s set · sample
        </p>
        <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.22em]">
          <span
            aria-hidden
            className={cn(
              "inline-block h-2.5 w-2.5 rounded-full",
              playing ? "animate-lamp bg-marquee-bright" : "bg-paper/40"
            )}
          />
          <span className={playing ? "text-marquee-bright" : "text-paper/65"}>
            {playing ? "On air" : "Off air"}
          </span>
        </p>
      </div>

      <ol>
        {CUES.map((cue, i) => {
          const isNow = i === now;
          return (
            <li key={cue}>
              <button
                onClick={() => {
                  reset();
                  setNow(i);
                }}
                aria-current={isNow ? "true" : undefined}
                className={cn(
                  "flex w-full items-baseline gap-4 border-b border-stage-line/60 px-5 py-3.5 text-left transition-colors last:border-0",
                  isNow ? "tape bg-stage-raised" : "hover:bg-stage-raised/50"
                )}
              >
                <span
                  className={cn(
                    "tnum font-display text-sm font-semibold tracking-[0.18em]",
                    isNow ? "text-marquee-bright" : "text-paper/65"
                  )}
                >
                  Q{i + 1}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[15px] font-medium leading-snug",
                    isNow ? "text-paper" : "text-paper/65"
                  )}
                >
                  {cue}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-stage-line px-5 py-4">
        <div
          aria-live="polite"
          className="min-h-[3.5rem] text-[15px] leading-relaxed text-paper/85"
        >
          {typed || (
            <span className="text-paper/65">
              Press play. Answer out loud; the room transcribes and scores.
            </span>
          )}
          {playing && (
            <span aria-hidden className="ml-0.5 inline-block h-4 w-[2px] animate-blink bg-marquee-bright align-middle" />
          )}
        </div>

        <div className="mt-3 flex min-h-[3rem] flex-wrap items-center gap-4">
          {stamped && (
            <p className="stamp animate-stamp-in border-marquee-bright text-marquee-bright">
              <span className="tnum">4.2 / 5</span>
            </p>
          )}
          {stamped && (
            <p className="max-w-xs flex-1 animate-cue-in text-sm text-paper/70">
              {SAMPLE_COACH}
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          {playing ? (
            <button onClick={stop} className="btn-paperline flex-1 text-paper">
              <Pause className="h-4 w-4" aria-hidden /> Hold
            </button>
          ) : (
            <button onClick={play} className="btn-marquee flex-1">
              <Play className="h-4 w-4" aria-hidden /> Play the sample
            </button>
          )}
          <button
            onClick={reset}
            aria-label="Reset sample"
            className="btn-paperline px-4 text-paper/70"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetlistBoard;
