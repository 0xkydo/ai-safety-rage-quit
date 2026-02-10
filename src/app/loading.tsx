import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-5 w-48 bg-bg-tertiary rounded-sm animate-pulse" />
        <div className="h-3 w-32 bg-bg-tertiary rounded-sm animate-pulse" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
