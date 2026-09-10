"use client";
import { planDataType } from "@/types/types";
import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import React from "react";

function PlanItemCard({ plan }: { plan: planDataType }) {
  return (
    <div className="border border-stage/25 bg-paper p-7 sm:p-9">
      <div className="border-b-2 border-stage pb-4">
        <h2 className="font-display text-3xl font-semibold uppercase tracking-wide">
          {plan.name}
        </h2>
        <p className="tnum mt-1 text-sm font-bold uppercase tracking-[0.18em] text-tungsten">
          No card · No trial clock
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {plan.offering.map((item, index) => (
          <li key={index} className="flex items-center gap-3 text-[15px] font-medium">
            {item.included ? (
              <Check className="h-5 w-5 shrink-0" strokeWidth={3} aria-hidden />
            ) : (
              <Minus className="h-5 w-5 shrink-0 text-tungsten" aria-hidden />
            )}
            <span className={item.included ? "" : "text-tungsten line-through"}>
              {item.value}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/dashboard"
        className="btn-marquee mt-7 w-full rounded-none"
      >
        Call your first mock
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export default PlanItemCard;
