"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DepartureWithRelations, Tweet, NewsArticle } from "@/types";

type DepartureFormProps = {
  action: (formData: FormData) => void;
  departure?: DepartureWithRelations;
};

type TweetEntry = {
  url: string;
  tweetId: string;
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
};

type ArticleEntry = {
  url: string;
  title: string;
  source: string;
  publishedAt: string;
};

export function DepartureForm({ action, departure }: DepartureFormProps) {
  const [tweets, setTweets] = useState<TweetEntry[]>(
    departure?.tweets.map((t: Tweet) => ({
      url: t.url,
      tweetId: t.tweetId,
      text: t.text || "",
      likes: t.likes,
      retweets: t.retweets,
      replies: t.replies,
      views: t.views,
    })) || []
  );

  const [articles, setArticles] = useState<ArticleEntry[]>(
    departure?.newsArticles.map((a: NewsArticle) => ({
      url: a.url,
      title: a.title,
      source: a.source,
      publishedAt: a.publishedAt
        ? new Date(a.publishedAt).toISOString().split("T")[0]
        : "",
    })) || []
  );

  const addTweet = () =>
    setTweets([
      ...tweets,
      { url: "", tweetId: "", text: "", likes: 0, retweets: 0, replies: 0, views: 0 },
    ]);

  const removeTweet = (idx: number) =>
    setTweets(tweets.filter((_, i) => i !== idx));

  const addArticle = () =>
    setArticles([...articles, { url: "", title: "", source: "", publishedAt: "" }]);

  const removeArticle = (idx: number) =>
    setArticles(articles.filter((_, i) => i !== idx));

  const inputClass =
    "w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50";
  const labelClass = "text-[10px] text-text-muted uppercase tracking-wider block mb-1";

  return (
    <form action={action} className="space-y-6">
      {/* Basic Info */}
      <div className="border border-border-primary bg-bg-secondary rounded-sm p-4 space-y-4">
        <h3 className="text-xs text-text-muted uppercase tracking-wider border-b border-border-primary pb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="personName" className={labelClass}>
              Name *
            </label>
            <input
              id="personName"
              name="personName"
              required
              defaultValue={departure?.personName}
              className={inputClass}
              placeholder="Jan Leike"
            />
          </div>
          <div>
            <label htmlFor="role" className={labelClass}>
              Role *
            </label>
            <input
              id="role"
              name="role"
              required
              defaultValue={departure?.role}
              className={inputClass}
              placeholder="Co-lead of Superalignment Team"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="company" className={labelClass}>
              Company *
            </label>
            <select
              id="company"
              name="company"
              required
              defaultValue={departure?.company || "OPENAI"}
              className={inputClass + " cursor-pointer"}
            >
              <option value="OPENAI">OpenAI</option>
              <option value="ANTHROPIC">Anthropic</option>
              <option value="GOOGLE_DEEPMIND">Google DeepMind</option>
            </select>
          </div>
          <div>
            <label htmlFor="departureDate" className={labelClass}>
              Departure Date *
            </label>
            <input
              id="departureDate"
              name="departureDate"
              type="date"
              required
              defaultValue={
                departure
                  ? new Date(departure.departureDate).toISOString().split("T")[0]
                  : ""
              }
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={departure?.status || "CONFIRMED"}
              className={inputClass + " cursor-pointer"}
            >
              <option value="CONFIRMED">Confirmed</option>
              <option value="RUMORED">Rumored</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="summary" className={labelClass}>
            Summary *
          </label>
          <textarea
            id="summary"
            name="summary"
            required
            defaultValue={departure?.summary}
            className={inputClass + " min-h-[100px] resize-y"}
            placeholder="Brief description of the departure..."
          />
        </div>

        <div>
          <label htmlFor="profileImageUrl" className={labelClass}>
            Profile Image URL
          </label>
          <input
            id="profileImageUrl"
            name="profileImageUrl"
            defaultValue={departure?.profileImageUrl || ""}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Tweets */}
      <div className="border border-border-primary bg-bg-secondary rounded-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border-primary pb-2">
          <h3 className="text-xs text-text-muted uppercase tracking-wider">
            Tweets ({tweets.length})
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={addTweet}>
            + Add Tweet
          </Button>
        </div>

        {tweets.map((tweet, idx) => (
          <div
            key={idx}
            className="border border-border-primary rounded-sm p-3 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-text-muted">
                Tweet #{idx + 1}
              </span>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeTweet(idx)}
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>URL *</label>
                <input
                  name={`tweet_url_${idx}`}
                  required
                  value={tweet.url}
                  onChange={(e) => {
                    const updated = [...tweets];
                    updated[idx] = { ...updated[idx], url: e.target.value };
                    // Auto-extract tweet ID from URL
                    const match = e.target.value.match(/status\/(\d+)/);
                    if (match) {
                      updated[idx].tweetId = match[1];
                    }
                    setTweets(updated);
                  }}
                  className={inputClass}
                  placeholder="https://x.com/user/status/123456"
                />
              </div>
              <div>
                <label className={labelClass}>Tweet ID *</label>
                <input
                  name={`tweet_id_${idx}`}
                  required
                  value={tweet.tweetId}
                  onChange={(e) => {
                    const updated = [...tweets];
                    updated[idx] = { ...updated[idx], tweetId: e.target.value };
                    setTweets(updated);
                  }}
                  className={inputClass}
                  placeholder="Auto-extracted from URL"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Text</label>
              <input
                name={`tweet_text_${idx}`}
                value={tweet.text}
                onChange={(e) => {
                  const updated = [...tweets];
                  updated[idx] = { ...updated[idx], text: e.target.value };
                  setTweets(updated);
                }}
                className={inputClass}
                placeholder="Tweet text content"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["likes", "retweets", "replies", "views"] as const).map(
                (metric) => (
                  <div key={metric}>
                    <label className={labelClass}>{metric}</label>
                    <input
                      name={`tweet_${metric}_${idx}`}
                      type="number"
                      min="0"
                      value={tweet[metric]}
                      onChange={(e) => {
                        const updated = [...tweets];
                        updated[idx] = {
                          ...updated[idx],
                          [metric]: Number(e.target.value),
                        };
                        setTweets(updated);
                      }}
                      className={inputClass}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* News Articles */}
      <div className="border border-border-primary bg-bg-secondary rounded-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border-primary pb-2">
          <h3 className="text-xs text-text-muted uppercase tracking-wider">
            News Articles ({articles.length})
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addArticle}
          >
            + Add Article
          </Button>
        </div>

        {articles.map((article, idx) => (
          <div
            key={idx}
            className="border border-border-primary rounded-sm p-3 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-text-muted">
                Article #{idx + 1}
              </span>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeArticle(idx)}
              >
                Remove
              </Button>
            </div>

            <div>
              <label className={labelClass}>URL *</label>
              <input
                name={`article_url_${idx}`}
                required
                value={article.url}
                onChange={(e) => {
                  const updated = [...articles];
                  updated[idx] = { ...updated[idx], url: e.target.value };
                  setArticles(updated);
                }}
                className={inputClass}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  name={`article_title_${idx}`}
                  required
                  value={article.title}
                  onChange={(e) => {
                    const updated = [...articles];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    setArticles(updated);
                  }}
                  className={inputClass}
                  placeholder="Article title"
                />
              </div>
              <div>
                <label className={labelClass}>Source *</label>
                <input
                  name={`article_source_${idx}`}
                  required
                  value={article.source}
                  onChange={(e) => {
                    const updated = [...articles];
                    updated[idx] = { ...updated[idx], source: e.target.value };
                    setArticles(updated);
                  }}
                  className={inputClass}
                  placeholder="New York Times"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Published Date</label>
              <input
                name={`article_published_${idx}`}
                type="date"
                value={article.publishedAt}
                onChange={(e) => {
                  const updated = [...articles];
                  updated[idx] = {
                    ...updated[idx],
                    publishedAt: e.target.value,
                  };
                  setArticles(updated);
                }}
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary">
          {departure ? "Update Departure" : "Create Departure"}
        </Button>
      </div>
    </form>
  );
}
