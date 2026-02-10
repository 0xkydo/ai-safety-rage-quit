export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default async function SubmissionsPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = submissions.filter((s) => s.status === "PENDING");
  const processed = submissions.filter((s) => s.status !== "PENDING");

  const statusVariant = (status: string) => {
    switch (status) {
      case "PENDING": return "amber" as const;
      case "APPROVED": return "green" as const;
      case "REJECTED": return "red" as const;
      case "DUPLICATE": return "muted" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-text-primary">
            BOT SUBMISSIONS
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {pending.length} pending review, {processed.length} processed
          </p>
        </div>
        <Badge variant={pending.length > 0 ? "amber" : "muted"}>
          {pending.length} PENDING
        </Badge>
      </div>

      {/* Setup notice */}
      {!process.env.X_BEARER_TOKEN && (
        <Card className="border-amber/30">
          <div className="text-xs text-amber">
            Twitter bot not configured. Set X_BEARER_TOKEN and CRON_SECRET env vars to enable.
            The cron polls /api/cron/poll-mentions every 5 minutes.
          </div>
        </Card>
      )}

      {/* Pending submissions */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs text-text-muted uppercase tracking-wider">
            Pending Review
          </h3>
          {pending.map((s) => (
            <Link
              key={s.id}
              href={`/admin/submissions/${s.id}`}
              className="block"
            >
              <Card className="hover:border-amber/50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-text-primary font-medium">
                        {s.parentAuthorName || "Unknown Author"}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        @{s.parentAuthor || "unknown"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                      {s.parentText || "No parent tweet text"}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-text-muted">
                      <span>Submitted by @{s.mentionAuthor}</span>
                      <span>{formatDate(s.createdAt)}</span>
                      {s.parentViews > 0 && (
                        <span>{formatNumber(s.parentViews)} views</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="amber">REVIEW</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Processed submissions */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs text-text-muted uppercase tracking-wider">
            Processed
          </h3>
          {processed.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-primary">
                      {s.parentAuthorName || "Unknown"}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      @{s.parentAuthor || "unknown"}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted line-clamp-1">
                    {s.parentText || "No text"}
                  </p>
                  {s.reviewNote && (
                    <p className="text-[10px] text-text-muted mt-1 italic">
                      {s.reviewNote}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {submissions.length === 0 && (
        <div className="text-center py-16 text-text-muted text-sm">
          No submissions yet. When people tag the bot under resignation tweets,
          they&apos;ll appear here for review.
        </div>
      )}
    </div>
  );
}
