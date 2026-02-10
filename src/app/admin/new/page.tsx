import { DepartureForm } from "@/components/admin/departure-form";
import { createDeparture } from "@/actions/departures";
import Link from "next/link";

export default function NewDeparturePage() {
  return (
    <div>
      <Link
        href="/admin"
        className="text-xs text-text-muted hover:text-amber transition-colors duration-150 mb-4 inline-block"
      >
        &larr; Back to admin
      </Link>
      <h2 className="text-sm font-bold text-text-primary mb-6">
        NEW DEPARTURE
      </h2>
      <DepartureForm action={createDeparture} />
    </div>
  );
}
