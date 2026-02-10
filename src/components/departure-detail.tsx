import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PublicityGauge } from "@/components/publicity-gauge";
import { COMPANY_LABELS } from "@/lib/constants";
import { formatDate, formatNumber, getScoreLabel } from "@/lib/utils";
import type { DepartureWithRelations, Tweet, NewsArticle } from "@/types";

type DepartureDetailProps = {
  departure: DepartureWithRelations;
};

export function DepartureDetail({ departure }: DepartureDetailProps) {
  const label = getScoreLabel(departure.publicityScore);
  const companyVariant: Record<string, "green" | "amber" | "default"> = {
    OPENAI: "green",
    ANTHROPIC: "amber",
    GOOGLE_DEEPMIND: "default",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-text-primary">
              {departure.personName}
            </h1>
            {departure.status === "RUMORED" && (
              <Badge variant="amber">Rumored</Badge>
            )}
          </div>
          <div className="text-sm text-text-secondary">{departure.role}</div>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={companyVariant[departure.company]}>
              {COMPANY_LABELS[departure.company]}
            </Badge>
            <span className="text-xs text-text-muted">
              {formatDate(departure.departureDate)}
            </span>
          </div>
        </div>

        {/* Score summary */}
        <div
          className="border rounded-sm p-3 min-w-[180px]"
          style={{ borderColor: `${label.color}30` }}
        >
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            Publicity Score
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: label.color }}>
            {departure.publicityScore.toFixed(1)}
          </div>
          <PublicityGauge score={departure.publicityScore} size="md" showScore={false} />
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            Summary
          </span>
        </CardHeader>
        <p className="text-sm text-text-secondary leading-relaxed">
          {departure.summary}
        </p>
      </Card>

      {/* Tweets */}
      {departure.tweets.length > 0 && (
        <Card>
          <CardHeader>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Related Tweets ({departure.tweets.length})
            </span>
          </CardHeader>
          <div className="space-y-4">
            {departure.tweets.map((tweet: Tweet) => (
              <div
                key={tweet.id}
                className="border border-border-primary rounded-sm p-3"
              >
                {tweet.text && (
                  <p className="text-sm text-text-secondary mb-3">
                    {tweet.text}
                  </p>
                )}
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-text-muted text-[10px]">LIKES</div>
                    <div className="text-text-primary tabular-nums">
                      {formatNumber(tweet.likes)}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px]">RETWEETS</div>
                    <div className="text-text-primary tabular-nums">
                      {formatNumber(tweet.retweets)}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px]">REPLIES</div>
                    <div className="text-text-primary tabular-nums">
                      {formatNumber(tweet.replies)}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted text-[10px]">VIEWS</div>
                    <div className="text-text-primary tabular-nums">
                      {formatNumber(tweet.views)}
                    </div>
                  </div>
                </div>
                <a
                  href={tweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-neon-green hover:underline mt-2 inline-block"
                >
                  View on X &rarr;
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* News Articles */}
      {departure.newsArticles.length > 0 && (
        <Card>
          <CardHeader>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              News Coverage ({departure.newsArticles.length})
            </span>
          </CardHeader>
          <div className="space-y-3">
            {departure.newsArticles.map((article: NewsArticle) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border-primary rounded-sm p-3 hover:border-border-secondary transition-colors duration-150"
              >
                <div className="text-sm text-text-primary hover:text-neon-green transition-colors duration-150">
                  {article.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-amber">{article.source}</span>
                  {article.publishedAt && (
                    <span className="text-[10px] text-text-muted">
                      {formatDate(article.publishedAt)}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
