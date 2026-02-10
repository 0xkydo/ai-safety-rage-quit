// X API v2 client for the Rage Quit Tracker bot
// Requires X_BEARER_TOKEN env var (Basic tier, $100/mo)

const X_API_BASE = "https://api.x.com/2";

function getHeaders(): HeadersInit {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// OAuth 1.0a headers for posting (bot replies)
// For write operations, we need user-context auth (OAuth 1.0a)
function getOAuthHeaders(): HeadersInit {
  const token = process.env.X_BOT_ACCESS_TOKEN;
  if (!token) throw new Error("X_BOT_ACCESS_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

type XTweet = {
  id: string;
  text: string;
  author_id: string;
  conversation_id?: string;
  in_reply_to_user_id?: string;
  referenced_tweets?: { type: string; id: string }[];
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    impression_count: number;
  };
  created_at?: string;
};

type XUser = {
  id: string;
  name: string;
  username: string;
};

type XMention = XTweet & {
  author: XUser;
};

type MentionsResponse = {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
    tweets?: XTweet[];
  };
  meta?: {
    newest_id?: string;
    oldest_id?: string;
    result_count?: number;
    next_token?: string;
  };
};

type TweetResponse = {
  data?: XTweet;
  includes?: {
    users?: XUser[];
  };
};

// Get the bot's own user ID (needed for mentions endpoint)
export async function getBotUserId(): Promise<string> {
  const res = await fetch(`${X_API_BASE}/users/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`X API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data.id;
}

// Get recent mentions of the bot
export async function getMentions(
  userId: string,
  sinceId?: string
): Promise<{ mentions: XMention[]; newestId?: string }> {
  const params = new URLSearchParams({
    "tweet.fields": "author_id,conversation_id,referenced_tweets,public_metrics,created_at,in_reply_to_user_id",
    "user.fields": "name,username",
    expansions: "author_id,referenced_tweets.id",
    max_results: "100",
  });
  if (sinceId) params.set("since_id", sinceId);

  const res = await fetch(
    `${X_API_BASE}/users/${userId}/mentions?${params}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(`X API error: ${res.status} ${await res.text()}`);

  const data: MentionsResponse = await res.json();
  if (!data.data || data.data.length === 0) {
    return { mentions: [], newestId: undefined };
  }

  const users = new Map(
    (data.includes?.users || []).map((u: XUser) => [u.id, u])
  );

  const mentions: XMention[] = data.data.map((tweet: XTweet) => ({
    ...tweet,
    author: users.get(tweet.author_id) || {
      id: tweet.author_id,
      name: "Unknown",
      username: "unknown",
    },
  }));

  return {
    mentions,
    newestId: data.meta?.newest_id,
  };
}

// Get a specific tweet with engagement metrics
export async function getTweet(tweetId: string): Promise<{
  tweet: XTweet;
  author: XUser;
} | null> {
  const params = new URLSearchParams({
    "tweet.fields": "author_id,public_metrics,created_at,text,conversation_id,referenced_tweets",
    "user.fields": "name,username",
    expansions: "author_id",
  });

  const res = await fetch(
    `${X_API_BASE}/tweets/${tweetId}?${params}`,
    { headers: getHeaders() }
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`X API error: ${res.status} ${await res.text()}`);
  }

  const data: TweetResponse = await res.json();
  if (!data.data) return null;

  const author = data.includes?.users?.[0] || {
    id: data.data.author_id,
    name: "Unknown",
    username: "unknown",
  };

  return { tweet: data.data, author };
}

// Post a reply tweet from the bot account
export async function postReply(
  inReplyToTweetId: string,
  text: string
): Promise<string | null> {
  try {
    const res = await fetch(`${X_API_BASE}/tweets`, {
      method: "POST",
      headers: getOAuthHeaders(),
      body: JSON.stringify({
        text,
        reply: { in_reply_to_tweet_id: inReplyToTweetId },
      }),
    });
    if (!res.ok) {
      console.error(`Failed to post reply: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.data?.id || null;
  } catch (err) {
    console.error("Error posting reply:", err);
    return null;
  }
}

// Extract parent tweet ID from a mention that is a reply
export function extractParentTweetId(tweet: XTweet): string | null {
  const replied = tweet.referenced_tweets?.find(
    (ref) => ref.type === "replied_to"
  );
  return replied?.id || null;
}
