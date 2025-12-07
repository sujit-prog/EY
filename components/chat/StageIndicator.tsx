"use client";

import { Stage } from "@/app/loan/chat/page";

interface Props {
  stage: Stage;
}

const steps: { id: Stage; label: string }[] = [
  { id: "intro", label: "Start" },
  { id: "verification", label: "Verification" },
  { id: "underwriting", label: "Underwriting" },
  { id: "offer", label: "Offer" },
];

export default function StageIndicator({ stage }: Props) {
  return (
    <div className="flex gap-2 border-b bg-slate-50 px-4 py-2 text-[11px] text-black"
>
      {steps.map((step, idx) => {
        const active = step.id === stage;
        return (
          <div
            key={step.id}
            className={[
              "flex-1 rounded-full border px-2 py-1 text-center",
              active ? "border-sky-500 bg-sky-50 font-semibold" : "opacity-70",
            ].join(" ")}
          >
            <span className="mr-1">{idx + 1}.</span>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
