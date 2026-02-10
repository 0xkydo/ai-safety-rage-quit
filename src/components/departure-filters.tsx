"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const COMPANIES = [
  { value: "", label: "All Companies" },
  { value: "OPENAI", label: "OpenAI" },
  { value: "ANTHROPIC", label: "Anthropic" },
  { value: "GOOGLE_DEEPMIND", label: "Google DeepMind" },
];

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "RUMORED", label: "Rumored" },
];

export function DepartureFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("company") || ""}
        onChange={(e) => updateFilter("company", e.target.value)}
        className="bg-bg-primary border border-border-secondary rounded-sm px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-green/50 cursor-pointer appearance-none"
      >
        {COMPANIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("status") || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="bg-bg-primary border border-border-secondary rounded-sm px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-green/50 cursor-pointer appearance-none"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search..."
        value={searchParams.get("search") || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="bg-bg-primary border border-border-secondary rounded-sm px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 w-48"
      />
    </div>
  );
}
