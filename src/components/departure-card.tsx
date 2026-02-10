import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PublicityGauge } from "@/components/publicity-gauge";
import { COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { DepartureWithRelations } from "@/types";

type DepartureCardProps = {
  departure: DepartureWithRelations;
};

export function DepartureCard({ departure }: DepartureCardProps) {
  const companyVariant: Record<string, "green" | "amber" | "default"> = {
    OPENAI: "green",
    ANTHROPIC: "amber",
    GOOGLE_DEEPMIND: "default",
  };

  return (
    <Link
      href={`/departures/${departure.id}`}
      className="block border border-border-primary bg-bg-secondary rounded-sm p-4 hover:border-border-secondary transition-colors duration-150"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-text-primary font-medium truncate">
            {departure.personName}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">{departure.role}</div>
        </div>
        {departure.status === "RUMORED" && (
          <Badge variant="amber">Rumored</Badge>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant={companyVariant[departure.company]}>
          {COMPANY_LABELS[departure.company]}
        </Badge>
        <span className="text-[10px] text-text-muted">
          {formatDate(departure.departureDate)}
        </span>
      </div>

      <PublicityGauge score={departure.publicityScore} size="sm" />
    </Link>
  );
}
