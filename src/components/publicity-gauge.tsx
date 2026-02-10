"use client";

import { cn, getScoreLabel } from "@/lib/utils";

type PublicityGaugeProps = {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showScore?: boolean;
};

export function PublicityGauge({
  score,
  size = "md",
  showLabel = true,
  showScore = true,
}: PublicityGaugeProps) {
  const label = getScoreLabel(score);
  const percentage = Math.min(100, Math.max(0, score));

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const textSizes = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className="flex flex-col gap-1">
      {(showLabel || showScore) && (
        <div className={cn("flex justify-between items-center", textSizes[size])}>
          {showLabel && (
            <span style={{ color: label.color }} className="font-medium">
              {label.label}
            </span>
          )}
          {showScore && (
            <span className="text-text-muted tabular-nums">
              {score.toFixed(1)}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-sm overflow-hidden bg-bg-tertiary",
          heights[size]
        )}
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Publicity score: ${score.toFixed(1)} - ${label.label}`}
      >
        <div
          className={cn(
            "h-full rounded-sm transition-all duration-500 ease-out",
            label.pulse && "animate-gauge-pulse"
          )}
          style={{
            width: `${percentage}%`,
            backgroundColor: label.color,
            boxShadow: `0 0 ${size === "lg" ? "8px" : "4px"} ${label.color}40`,
          }}
        />
      </div>
    </div>
  );
}
