import { SCORE_LABELS } from "./constants";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getScoreLabel(score: number) {
  return (
    SCORE_LABELS.find((s) => score >= s.min && score <= s.max) ??
    SCORE_LABELS[0]
  );
}

export function getScoreColor(score: number): string {
  return getScoreLabel(score).color;
}
