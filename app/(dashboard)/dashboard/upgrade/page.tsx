import React from "react";

import PlanItemCard from "./_components/PlanItemCard";
import { planData } from "@/Data/data";

function Upgrade() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
          Free forever
        </h1>
        <p className="mt-3 leading-relaxed text-tungsten">
          No tiers, no trial clock, no card. Every mock and every report is
          included while we build the room out.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-5">
        {planData.map((plan, index) => (
          <PlanItemCard plan={plan} key={index} />
        ))}
      </div>
    </div>
  );
}

export default Upgrade;
