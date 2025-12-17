import type { Stage } from "@/lib/memory";

interface StageIndicatorProps {
  currentStage: Stage;
}

const stages: { id: Stage; label: string; icon: string }[] = [
  { id: "discovery", label: "Discovery", icon: "🔍" },
  { id: "sales", label: "Offers", icon: "💰" },
  { id: "verification", label: "Verification", icon: "📄" },
  { id: "underwriting", label: "Underwriting", icon: "⚙️" },
  { id: "sanctioned", label: "Approved", icon: "✅" },
];

const normalizeStage = (stage: Stage): Stage => {
  if (["welcome", "phone_request", "otp_verification"].includes(stage)) {
    return "discovery";
  }
  return stage;
};

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  const normalizedStage = normalizeStage(currentStage);
  const currentIndex = stages.findIndex((s) => s.id === normalizedStage);

  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 px-3 py-2 border border-slate-800">
      {stages.map((stage, index) => {
        const isActive = stage.id === normalizedStage;
        const isCompleted = currentIndex > index;
        const isPending = currentIndex < index;

        return (
          <div key={stage.id} className="flex items-center gap-2">
            {/* Stage Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                  isCompleted
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/30"
                    : isActive
                    ? "border-sky-400 bg-sky-500/20 text-sky-100 shadow-lg shadow-sky-500/30 animate-pulse"
                    : "border-slate-600 bg-slate-800 text-slate-500",
                ].join(" ")}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{stage.icon}</span>
                )}
              </div>
              
              {/* Stage Label */}
              <span
                className={[
                  "text-[10px] font-medium whitespace-nowrap",
                  isCompleted
                    ? "text-emerald-300"
                    : isActive
                    ? "text-sky-200"
                    : "text-slate-500",
                ].join(" ")}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="relative h-px w-6 flex-shrink-0">
                <div className="absolute inset-0 bg-slate-700" />
                <div
                  className={[
                    "absolute inset-0 transition-all duration-500",
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-400"
                      : "bg-transparent",
                  ].join(" ")}
                  style={{
                    width: isCompleted ? "100%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}