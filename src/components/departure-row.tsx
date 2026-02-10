import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PublicityGauge } from "@/components/publicity-gauge";
import { COMPANY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { DepartureWithRelations } from "@/types";

type DepartureRowProps = {
  departure: DepartureWithRelations;
};

export function DepartureRow({ departure }: DepartureRowProps) {
  const companyVariant: Record<string, "green" | "amber" | "default"> = {
    OPENAI: "green",
    ANTHROPIC: "amber",
    GOOGLE_DEEPMIND: "default",
  };

  return (
    <Link
      href={`/departures/${departure.id}`}
      className="grid grid-cols-[1fr_120px_100px_140px_80px] gap-4 items-center px-4 py-3 border-b border-border-primary hover:bg-bg-tertiary/50 transition-colors duration-150 group"
    >
      <div className="min-w-0">
        <div className="text-sm text-text-primary group-hover:text-neon-green transition-colors duration-150 truncate">
          {departure.personName}
        </div>
        <div className="text-[10px] text-text-muted truncate">
          {departure.role}
        </div>
      </div>

      <div>
        <Badge variant={companyVariant[departure.company]}>
          {COMPANY_LABELS[departure.company]}
        </Badge>
      </div>

      <div className="text-xs text-text-secondary tabular-nums">
        {formatDate(departure.departureDate)}
      </div>

      <div className="w-full">
        <PublicityGauge score={departure.publicityScore} size="sm" showLabel={false} />
      </div>

      <div className="text-right">
        {departure.status === "RUMORED" && (
          <Badge variant="amber">Rumored</Badge>
        )}
      </div>
    </Link>
  );
}
