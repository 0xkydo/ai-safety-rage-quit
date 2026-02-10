"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SortField } from "@/types";

type SortHeaderProps = {
  label: string;
  field: SortField;
  className?: string;
};

export function SortHeader({ label, field, className }: SortHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "date";
  const currentDirection = searchParams.get("direction") || "desc";
  const isActive = currentSort === field;

  const handleClick = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    params.set(
      "direction",
      isActive && currentDirection === "desc" ? "asc" : "desc"
    );
    router.push(`?${params.toString()}`);
  }, [router, searchParams, field, isActive, currentDirection]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium cursor-pointer transition-colors duration-150",
        isActive ? "text-neon-green" : "text-text-muted hover:text-text-secondary",
        className
      )}
    >
      {label}
      {isActive && (
        <span className="text-neon-green">
          {currentDirection === "desc" ? "\u25BC" : "\u25B2"}
        </span>
      )}
    </button>
  );
}
