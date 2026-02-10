import { SortHeader } from "@/components/ui/sort-header";
import { DepartureRow } from "@/components/departure-row";
import { DepartureCard } from "@/components/departure-card";
import type { DepartureWithRelations } from "@/types";

type DepartureTableProps = {
  departures: DepartureWithRelations[];
};

export function DepartureTable({ departures }: DepartureTableProps) {
  if (departures.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-text-muted text-sm">No departures found</div>
        <div className="text-text-muted text-xs mt-1">
          Try adjusting your filters
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-border-primary rounded-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_100px_140px_80px] gap-4 items-center px-4 py-2 bg-bg-tertiary border-b border-border-primary">
          <SortHeader label="Name" field="name" />
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Company
          </span>
          <SortHeader label="Date" field="date" />
          <SortHeader label="Publicity" field="score" />
          <span className="text-[10px] text-text-muted uppercase tracking-wider text-right">
            Status
          </span>
        </div>
        {departures.map((d) => (
          <DepartureRow key={d.id} departure={d} />
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {departures.map((d) => (
          <DepartureCard key={d.id} departure={d} />
        ))}
      </div>
    </>
  );
}
