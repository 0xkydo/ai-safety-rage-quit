export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import { approveSubmission, rejectSubmission } from "@/actions/submissions";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) notFound();

  const isPending = submission.status === "PENDING";
  const boundApprove = approveSubmission.bind(null, id);
  const boundReject = rejectSubmission.bind(null, id);

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/submissions"
        className="text-xs text-text-muted hover:text-amber transition-colors duration-150 mb-4 inline-block"
      >
        &larr; Back to submissions
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-sm font-bold text-text-primary">
          REVIEW SUBMISSION
        </h2>
        <Badge
          variant={
            submission.status === "PENDING"
              ? "amber"
              : submission.status === "APPROVED"
                ? "green"
                : "red"
          }
        >
          {submission.status}
        </Badge>
      </div>

      {/* Parent tweet info */}
      <Card className="mb-4">
        <CardHeader>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Resignation Tweet
          </span>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-primary font-medium">
              {submission.parentAuthorName || "Unknown"}
            </span>
            <span className="text-xs text-text-muted">
              @{submission.parentAuthor || "unknown"}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {submission.parentText || "No tweet text available"}
          </p>
          {submission.parentTweetUrl && (
            <a
              href={submission.parentTweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neon-green hover:underline"
            >
              View on X &rarr;
            </a>
          )}
          <div className="grid grid-cols-4 gap-4 text-xs pt-2 border-t border-border-primary">
            <div>
              <div className="text-[10px] text-text-muted">LIKES</div>
              <div className="text-text-primary tabular-nums">
                {formatNumber(submission.parentLikes)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">RETWEETS</div>
              <div className="text-text-primary tabular-nums">
                {formatNumber(submission.parentRetweets)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">REPLIES</div>
              <div className="text-text-primary tabular-nums">
                {formatNumber(submission.parentReplies)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">VIEWS</div>
              <div className="text-text-primary tabular-nums">
                {formatNumber(submission.parentViews)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Submission meta */}
      <Card className="mb-6">
        <CardHeader>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Submitted By
          </span>
        </CardHeader>
        <div className="text-xs text-text-secondary">
          @{submission.mentionAuthor} tagged the bot on{" "}
          {formatDate(submission.createdAt)}
        </div>
        {submission.mentionText && (
          <p className="text-xs text-text-muted mt-1 italic">
            &quot;{submission.mentionText}&quot;
          </p>
        )}
      </Card>

      {/* Approve/Reject actions */}
      {isPending && (
        <div className="space-y-6">
          {/* Approve form */}
          <Card>
            <CardHeader>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                Approve as Departure
              </span>
            </CardHeader>
            <form action={boundApprove} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                    Person Name *
                  </label>
                  <input
                    name="personName"
                    required
                    defaultValue={submission.parentAuthorName || ""}
                    className="w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-green/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                    Role *
                  </label>
                  <input
                    name="role"
                    required
                    className="w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-green/50"
                    placeholder="e.g. Safety Researcher"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                    Company *
                  </label>
                  <select
                    name="company"
                    required
                    className="w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-green/50 cursor-pointer"
                  >
                    <option value="OPENAI">OpenAI</option>
                    <option value="ANTHROPIC">Anthropic</option>
                    <option value="GOOGLE_DEEPMIND">Google DeepMind</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                    Departure Date *
                  </label>
                  <input
                    name="departureDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-green/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                  Summary *
                </label>
                <textarea
                  name="summary"
                  required
                  className="w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-green/50 min-h-[80px] resize-y"
                  placeholder="Brief description of the departure..."
                />
              </div>
              <Button type="submit" variant="primary">
                Approve and Create Departure
              </Button>
            </form>
          </Card>

          {/* Reject button */}
          <form action={boundReject}>
            <Button type="submit" variant="danger">
              Reject Submission
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
