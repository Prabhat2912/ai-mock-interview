import { navLinks, planDataType } from "@/types/types";

export const options: navLinks[] = [
  {
    id: 1,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    id: 2,
    name: "Questions",
    path: "/questions",
  },
  {
    id: 3,
    name: "Upgrade",
    path: "/dashboard/upgrade",
  },
  {
    id: 4,
    name: "How it Works?",
    path: "#hiw",
  },
];
export const planData: planDataType[] = [
  {
    id: 1,
    name: "Free",
    cost: 0,
    offering: [
      {
        value: "✔️ Create 3 Free Mock Interview",
      },
      {
        value: "✔️ Unlimited Retake Interview",
      },
      {
        value: "❌ Practice Question",
      },
      {
        value: "❌ Exlcusive App Access",
      },
      {
        value: "❌ Email Support",
      },
    ],
  },
  {
    id: 1,
    name: "Monthly",
    cost: 7.99,
    paymentLink: "https://buy.stripe.com/test_28o9EjbkvgfQ8VOeUV",
    offering: [
      {
        value: "✔️ Create 3 Free Mock Interview",
      },
      {
        value: "✔️ Unlimited Retake Interview",
      },
      {
        value: "✔️ Practice Question",
      },
      {
        value: "✔️ Exlcusive App Access",
      },
      {
        value: "✔️ Email Support",
      },
    ],
  },
];
