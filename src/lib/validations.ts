import { z } from "zod";

export const departureFiltersSchema = z.object({
  company: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE_DEEPMIND"]).optional(),
  status: z.enum(["CONFIRMED", "RUMORED"]).optional(),
  sort: z.enum(["date", "score", "name"]).optional().default("date"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
});

export const createDepartureSchema = z.object({
  personName: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  company: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE_DEEPMIND"]),
  departureDate: z.string().min(1, "Date is required"),
  summary: z.string().min(1, "Summary is required"),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["CONFIRMED", "RUMORED"]).optional().default("CONFIRMED"),
});

export const updateDepartureSchema = createDepartureSchema.partial();

export const tweetSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  tweetId: z.string().min(1, "Tweet ID is required"),
  text: z.string().optional(),
  likes: z.coerce.number().int().min(0).default(0),
  retweets: z.coerce.number().int().min(0).default(0),
  replies: z.coerce.number().int().min(0).default(0),
  views: z.coerce.number().int().min(0).default(0),
});

export const newsArticleSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  title: z.string().min(1, "Title is required"),
  source: z.string().min(1, "Source is required"),
  publishedAt: z.string().optional(),
});

export type CreateDepartureInput = z.infer<typeof createDepartureSchema>;
export type UpdateDepartureInput = z.infer<typeof updateDepartureSchema>;
export type TweetInput = z.infer<typeof tweetSchema>;
export type NewsArticleInput = z.infer<typeof newsArticleSchema>;
