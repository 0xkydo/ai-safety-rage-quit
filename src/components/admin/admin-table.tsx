"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { deleteDeparture } from "@/actions/departures";
import { recomputePublicityScore } from "@/actions/metrics";
import type { DepartureWithRelations } from "@/types";
import { useTransition } from "react";

type AdminTableProps = {
  departures: DepartureWithRelations[];
};

function AdminRow({ departure }: { departure: DepartureWithRelations }) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();

  return (
    <div className="grid grid-cols-[1fr_100px_80px_80px_160px] gap-4 items-center px-4 py-3 border-b border-border-primary hover:bg-bg-tertiary/30 transition-colors duration-150">
      <div className="min-w-0">
        <Link
          href={`/departures/${departure.id}`}
          className="text-sm text-text-primary hover:text-neon-green transition-colors duration-150"
        >
          {departure.personName}
        </Link>
        <div className="text-[10px] text-text-muted">{departure.role}</div>
      </div>

      <Badge
        variant={
          departure.company === "OPENAI"
            ? "green"
            : departure.company === "ANTHROPIC"
              ? "amber"
              : "default"
        }
      >
        {COMPANY_LABELS[departure.company]}
      </Badge>

      <div className="text-xs text-text-secondary tabular-nums">
        {formatDate(departure.departureDate)}
      </div>

      <div className="text-xs text-text-secondary tabular-nums">
        {departure.publicityScore.toFixed(1)}
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/admin/${departure.id}/edit`}>
          <Button variant="secondary" size="sm">
            Edit
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="sm"
          disabled={isRefreshing}
          onClick={() =>
            startRefreshTransition(async () => {
              await recomputePublicityScore(departure.id);
            })
          }
        >
          {isRefreshing ? "..." : "Rescore"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Delete ${departure.personName}?`)) {
              startDeleteTransition(() => deleteDeparture(departure.id));
            }
          }}
        >
          {isDeleting ? "..." : "Del"}
        </Button>
      </div>
    </div>
  );
}

export function AdminTable({ departures }: AdminTableProps) {
  if (departures.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted text-sm">
        No departures yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="border border-border-primary rounded-sm overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_80px_80px_160px] gap-4 items-center px-4 py-2 bg-bg-tertiary border-b border-border-primary">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Name
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Company
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Date
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Score
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Actions
        </span>
      </div>
      {departures.map((d) => (
        <AdminRow key={d.id} departure={d} />
      ))}
    </div>
  );
}
