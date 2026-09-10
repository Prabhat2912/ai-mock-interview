import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";

const Dashboard = () => {
  return (
    <div className="pt-8">
      {/* Masthead band */}
      <div className="bg-stage px-6 py-8 text-paper sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
              Callboard
            </h1>
            <p className="mt-2 max-w-lg leading-relaxed text-paper/70">
              Call a new mock, or pick up where the last performance left
              off. Every session keeps its reviews.
            </p>
          </div>
          <AddNewInterview variant="masthead" />
        </div>
      </div>

      {/* Rehearsal notes */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="border border-stage/25 bg-paper-deep/40 p-5">
          <p className="font-display text-lg font-semibold uppercase tracking-wide">
            Write a specific sheet
          </p>
          <p className="mt-1 text-sm leading-relaxed text-tungsten">
            “Senior React, Next.js and testing, four years, fintech” gets
            sharper cues than “frontend dev”.
          </p>
        </div>
        <div className="border border-stage/25 bg-paper-deep/40 p-5">
          <p className="font-display text-lg font-semibold uppercase tracking-wide">
            Switch the camera on
          </p>
          <p className="mt-1 text-sm leading-relaxed text-tungsten">
            Video takes earn presence readings — confidence and nerves, take
            by take.
          </p>
        </div>
      </div>

      <div id="ledger" className="mt-10 scroll-mt-24">
        <InterviewList />
      </div>
    </div>
  );
};

export default Dashboard;
