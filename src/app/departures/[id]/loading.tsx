import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function DepartureLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-3 w-32" />
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-24 w-44" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
