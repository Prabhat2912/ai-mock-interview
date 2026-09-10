import Header from "@/app/(dashboard)/dashboard/_components/Header";
import SetlistBoard from "@/app/_components/SetlistBoard";
import Link from "next/link";
import { ArrowRight, Check, Mic, ScanFace, Star } from "lucide-react";

const LOOP = [
  {
    verb: "Call it",
    title: "Describe the role in thirty seconds",
    desc: "Job title, stack, years of experience. The room writes five questions you could actually be asked.",
  },
  {
    verb: "Play it",
    title: "Answer out loud, on mic and camera",
    desc: "Talk the way you will in the room. Every word is transcribed live; presence is read from video.",
  },
  {
    verb: "Read the reviews",
    title: "Get scored like it mattered",
    desc: "A mark out of five on every answer, the model answer beside yours, and one line on what earns full marks.",
  },
];

const ROOM_GIVES = [
  {
    cue: "Questions with intent",
    desc: "Generated from your role, stack, and experience — not a generic bank of four hundred.",
  },
  {
    cue: "A transcript of record",
    desc: "Everything you say is written down while you say it, so rambling has nowhere to hide.",
  },
  {
    cue: "Presence, read honestly",
    desc: "Optional video gives you confidence and nervousness readings per answer, plus a session summary.",
  },
  {
    cue: "Model answers",
    desc: "Every answer is paired with what good sounds like, in four beats you can steal.",
  },
  {
    cue: "Retakes without judgment",
    desc: "Run the set again tonight. The ledger keeps every performance; only you see the early ones.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stage text-paper">
      <Header />

      {/* FIRST VIEWPORT — the stage */}
      <section className="grain">
        <div className="container-x grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1fr_1fr] lg:pt-20">
          <div>
            <h1 className="text-balance font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Walk in
              <br />
              rehearsed.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/75">
              A free backstage for your interview. Answer real questions out
              loud on mic and camera, and get scored with model answers before
              the night that counts.
            </p>
            <div className="mt-8">
              <Link href="/dashboard" className="btn-marquee w-full sm:w-auto">
                Take the stage — start free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="tnum mt-4 text-sm font-medium text-paper/70">
                Free forever. No card. First mock in about a minute.
              </p>
            </div>
          </div>

          <SetlistBoard />
        </div>
      </section>

      {/* THE LOOP — cue rows */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-stage-line">
        <div className="container-x py-16 lg:py-24">
          <h2 className="max-w-xl text-balance font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
            Three cues. Then curtain.
          </h2>
          <div className="mt-10">
            {LOOP.map((step) => (
              <div
                key={step.verb}
                className="grid gap-2 border-t border-stage-line py-7 last:border-b sm:grid-cols-[180px_1fr] sm:gap-8"
              >
                <p className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-marquee-bright">
                  {step.verb}
                </p>
                <div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="mt-1 max-w-xl leading-relaxed text-paper/65">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT THE ROOM GIVES YOU */}
      <section id="features" className="scroll-mt-20 border-t border-stage-line bg-stage-soft">
        <div className="container-x grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr] lg:py-24">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-balance font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
              What the room gives you
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-paper/65">
              Not a question bank. A rehearsal with a transcript, a score,
              and notes you can act on tonight.
            </p>
            <Link
              href="/dashboard"
              className="btn-paperline mt-7 text-paper"
            >
              Open the callboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div>
            {ROOM_GIVES.map((f) => (
              <div
                key={f.cue}
                className="border-t border-stage-line py-6 last:border-b"
              >
                <h3 className="font-display text-2xl font-semibold uppercase tracking-wide">
                  {f.cue}
                </h3>
                <p className="mt-1.5 max-w-lg leading-relaxed text-paper/65">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE REPORT — paper sheet pinned on stage */}
      <section id="sample" className="scroll-mt-20 border-t border-stage-line">
        <div className="container-x py-16 lg:py-24">
          <h2 className="max-w-xl text-balance font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
            The reviews teach.
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-paper/65">
            A sample sheet, invented to show the shape of a real report. Yours
            is written about your answers, seconds after you stop recording.
          </p>

          <div className="grain mt-10 bg-paper p-6 text-stage shadow-stage sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-stage pb-4">
              <p className="font-display text-lg font-semibold uppercase tracking-[0.18em]">
                Session N-001 · sample
              </p>
              <p className="stamp rotate-[-4deg] border-stage text-stage">
                <span className="tnum">3.1 / 5</span>
              </p>
            </div>
            <p className="mt-6 font-display text-2xl font-semibold uppercase leading-tight tracking-wide sm:text-3xl">
              Explain the event loop in Node.js
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tungsten">
                  Your answer
                </h3>
                <p className="mt-2 leading-relaxed text-stage/85">
                  “It handles async stuff so the server doesn&apos;t block… I
                  think there are phases?”
                </p>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tungsten">
                  The model answer
                </h3>
                <p className="mt-2 leading-relaxed text-stage/85">
                  Four beats: the single thread, the libuv phases, micro
                  against macro tasks, one production story.
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-stage/20 pt-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tungsten">
                The note
              </h3>
              <p className="mt-2 max-w-2xl text-lg font-medium leading-snug">
                Cut the fillers, name the six phases, end with an incident you
                actually debugged. That is a five.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREE BAND */}
      <section id="free" className="scroll-mt-20 bg-marquee text-stage">
        <div className="container-x grid items-center gap-8 py-14 lg:grid-cols-[1.4fr_1fr] lg:py-20">
          <div>
            <h2 className="text-balance font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">
              Free. Every mock, every report.
            </h2>
            <ul className="mt-6 space-y-2.5 font-medium">
              {[
                "Unlimited mock interviews",
                "Scores, model answers, and coaching notes",
                "Voice, video, and presence readings",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:text-right">
            <Link
              href="/dashboard"
              className="btn-marquee w-full !bg-stage !text-paper hover:!bg-stage-soft sm:w-auto lg:w-full"
            >
              Start your first mock
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-3 text-sm font-semibold text-stage/70">
              No card. No trial clock. Just the room.
            </p>
          </div>
        </div>
      </section>

      {/* STAGE DOOR */}
      <footer className="border-t border-stage-line">
        <div className="container-x py-12">
          <p className="font-display text-5xl font-bold uppercase leading-none tracking-tight sm:text-6xl">
            Places, please.
          </p>
          <div className="mt-8 flex flex-col justify-between gap-6 border-t border-stage-line pt-6 text-sm sm:flex-row sm:items-center">
            <p className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center bg-marquee font-display text-sm font-bold text-stage">
                AI
              </span>
              <span className="font-medium text-paper/60">
                Interviewai · Rehearse it before you live it.
              </span>
            </p>
            <nav aria-label="Footer" className="flex gap-6 font-semibold uppercase tracking-[0.12em] text-paper/60">
              <Link href="#features" className="transition-colors hover:text-paper">
                Features
              </Link>
              <Link href="#how-it-works" className="transition-colors hover:text-paper">
                The loop
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-paper">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-stage-line/60 pt-6 text-paper/65">
            <p className="flex items-center gap-2 text-sm">
              <Mic className="h-4 w-4" aria-hidden /> Voice with live transcript
            </p>
            <p className="flex items-center gap-2 text-sm">
              <ScanFace className="h-4 w-4" aria-hidden /> Presence from video
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" aria-hidden /> Scored out of five
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
