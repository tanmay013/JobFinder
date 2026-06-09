import type { JobRole } from "@/features/posts/types";

function env(key: string, fallback = ""): string {
  return process.env[key]?.trim() ?? fallback;
}

function parseSearchQueries(raw: string): string[] {
  return raw
    .split(",")
    .map((q) => q.trim())
    .filter(Boolean);
}

const DEFAULT_FRONTEND_SEARCH_QUERIES = [
  "hiring frontend engineer",
  "hiring senior frontend developer",
  "hiring react developer",
  "hiring full stack developer react",
  "hiring javascript developer",
  "hiring typescript developer",
  "hiring software engineer frontend",
  "hiring ui engineer",
  "hiring web developer react",
  "hiring next.js developer",
];

const DEFAULT_QA_SEARCH_QUERIES = [
  "hiring QA engineer",
  "hiring SDET",
  "hiring QA automation engineer",
  "hiring SDET engineer",
  "hiring quality assurance engineer",
  "hiring test automation engineer",
  "hiring software development engineer in test",
  "hiring automation tester",
  "hiring senior SDET",
  "hiring QA lead",
];

export interface RoleLinkedInConfig {
  searchQueries: string[];
  cacheFile: string;
}

export function getRoleLinkedInConfig(role: JobRole): RoleLinkedInConfig {
  if (role === "qa") {
    return {
      searchQueries: parseSearchQueries(
        env("LINKEDIN_QA_SEARCH_QUERIES", DEFAULT_QA_SEARCH_QUERIES.join(",")),
      ),
      cacheFile: env("LINKEDIN_QA_CACHE_FILE", "data/linkedin-posts-qa.json"),
    };
  }

  return {
    searchQueries: parseSearchQueries(
      env(
        "LINKEDIN_SEARCH_QUERIES",
        DEFAULT_FRONTEND_SEARCH_QUERIES.join(","),
      ),
    ),
    cacheFile: env("LINKEDIN_CACHE_FILE", "data/linkedin-posts.json"),
  };
}

export const linkedInConfig = {
  apifyToken: env("APIFY_API_TOKEN"),
  apifyActorId: env("APIFY_ACTOR_ID", "harvestapi~linkedin-post-search"),
  apifyBaseUrl: env("APIFY_BASE_URL", "https://api.apify.com"),
  postedLimit: env("LINKEDIN_POSTED_LIMIT", "week") as
    | "any"
    | "1h"
    | "24h"
    | "week"
    | "month"
    | "3months"
    | "6months"
    | "year",
  /** Raw posts to pull from Apify per fetch (deduped after). */
  maxPostsPerFetch: Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(env("LINKEDIN_MAX_POSTS_PER_FETCH", "50"), 10) || 50,
    ),
  ),
  /** Max matching posts shown after filtering. */
  maxResults: Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(env("LINKEDIN_MAX_RESULTS", "50"), 10) || 50,
    ),
  ),
  minExperienceYears: Math.max(
    0,
    Number.parseFloat(env("LINKEDIN_MIN_EXPERIENCE_YEARS", "2.5")) || 2.5,
  ),
  fetchIntervalHours: Math.max(
    1,
    Number.parseInt(env("LINKEDIN_FETCH_INTERVAL_HOURS", "6"), 10) || 6,
  ),
} as const;

export function isLinkedInConfigured(): boolean {
  return Boolean(linkedInConfig.apifyToken);
}
