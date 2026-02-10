"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="text-red text-sm font-bold">SYSTEM ERROR</div>
      <div className="text-text-muted text-xs max-w-md text-center">
        {error.message || "An unexpected error occurred"}
      </div>
      {error.digest && (
        <div className="text-text-muted text-[10px]">
          Error ID: {error.digest}
        </div>
      )}
      <Button onClick={reset} variant="primary">
        Retry
      </Button>
    </div>
  );
}
