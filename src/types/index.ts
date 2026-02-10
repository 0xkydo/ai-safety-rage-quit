import type { Departure, Tweet, NewsArticle } from "@/generated/prisma/client";
import type { Company, DepartureStatus } from "@/generated/prisma/enums";

export type { Departure, Tweet, NewsArticle, Company, DepartureStatus };

export type DepartureWithRelations = Departure & {
  tweets: Tweet[];
  newsArticles: NewsArticle[];
};

export type SortField = "date" | "score" | "name";
export type SortDirection = "asc" | "desc";

export type DepartureFilters = {
  company?: Company;
  status?: DepartureStatus;
  sort?: SortField;
  direction?: SortDirection;
  search?: string;
};
