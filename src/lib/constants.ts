export const COMPANY_LABELS: Record<string, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GOOGLE_DEEPMIND: "Google DeepMind",
};

export const COMPANY_COLORS: Record<string, string> = {
  OPENAI: "#00A67E",
  ANTHROPIC: "#D4A574",
  GOOGLE_DEEPMIND: "#4285F4",
};

export const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  RUMORED: "Rumored",
};

type ScoreLabel = {
  min: number;
  max: number;
  label: string;
  color: string;
  pulse?: boolean;
};

export const SCORE_LABELS: ScoreLabel[] = [
  { min: 0, max: 20, label: "Quiet Exit", color: "#555555" },
  { min: 21, max: 40, label: "Notable", color: "#FFB000" },
  { min: 41, max: 60, label: "Significant", color: "#FFD000" },
  { min: 61, max: 80, label: "Major", color: "#00FF41" },
  { min: 81, max: 100, label: "Viral", color: "#00FF41", pulse: true },
];

export const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "score", label: "Publicity Score" },
  { value: "name", label: "Name" },
] as const;
