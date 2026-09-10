import { navLinks, planDataType } from "@/types/types";

export const options: navLinks[] = [
  {
    id: 1,
    name: "Features",
    path: "/#features",
  },
  {
    id: 2,
    name: "How it works",
    path: "/#how-it-works",
  },
  {
    id: 3,
    name: "Free forever",
    path: "/#free",
  },
  {
    id: 4,
    name: "Dashboard",
    path: "/dashboard",
  },
];
export const planData: planDataType[] = [
  {
    id: 1,
    name: "Free forever",
    cost: 0,
    offering: [
      { value: "Unlimited mock interviews", included: true },
      { value: "AI ratings and model answers", included: true },
      { value: "Voice answers with live transcript", included: true },
      { value: "Video presence and behavior insights", included: true },
      { value: "Session history and retakes", included: true },
    ],
  },
];
