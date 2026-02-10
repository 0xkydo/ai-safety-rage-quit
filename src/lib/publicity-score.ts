type TweetMetrics = {
  likes: number;
  retweets: number;
  replies: number;
  views: number;
};

export function computeTweetScore(tweets: TweetMetrics[]): number {
  if (tweets.length === 0) return 0;

  const totalEngagement = tweets.reduce((sum, t) => {
    return sum + t.retweets * 3 + t.replies * 2 + t.likes * 1 + t.views * 0.01;
  }, 0);

  return Math.min(70, Math.log10(Math.max(1, totalEngagement)) * 10);
}

export function computeNewsScore(articleCount: number): number {
  if (articleCount === 0) return 0;
  return Math.min(30, (articleCount * 10) / (1 + articleCount * 0.25));
}

export function computePublicityScore(
  tweets: TweetMetrics[],
  articleCount: number
): number {
  const tweetScore = computeTweetScore(tweets);
  const newsScore = computeNewsScore(articleCount);
  return Math.round((tweetScore + newsScore) * 10) / 10;
}
