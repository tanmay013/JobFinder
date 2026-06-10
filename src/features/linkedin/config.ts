import "server-only";

import type { JobRole } from "@/features/posts/types";

type PostedLimit =
  | "any"
  | "1h"
  | "24h"
  | "week"
  | "month"
  | "3months"
  | "6months"
  | "year";

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

/** LinkedIn limits each search query to 85 characters (Apify harvestapi actor). */
const LINKEDIN_MAX_QUERY_LENGTH = 85;

const DEFAULT_QA_SEARCH_QUERIES = [
  '(hiring OR "we are hiring") AND SDET AND Selenium AND India',
  '(hiring OR "we are hiring") AND SDET AND Playwright AND remote',
  '(hiring OR "we are hiring") AND "QA automation" AND Cypress AND Pune',
  '(hiring OR "we are hiring") AND SDET AND Java AND Mumbai',
  '(hiring OR "we are hiring") AND SDET AND Appium AND Delhi',
  '(hiring OR "we are hiring") AND "test automation" AND Kolkata',
  '(hiring OR "we are hiring") AND SDET AND TestNG AND Gurugram',
  '(hiring OR "we are hiring") AND "QA engineer" AND Cypress AND remote',
  '("urgent hiring" OR hiring) AND SDET AND Java AND NCR',
  '(hiring OR "we are hiring") AND SDET AND "API testing" AND India',
  '(hiring OR "we are hiring") AND SDET AND Cucumber AND Pune',
  '(hiring OR "we are hiring") AND SDET AND Maestro AND Mumbai',
  '"we are hiring" AND SDET AND Selenium AND remote',
  '(hiring OR "we are hiring") AND SDET AND "Rest Assured" AND India',
].filter((query) => query.length <= LINKEDIN_MAX_QUERY_LENGTH);

/** Runtime env lookup — avoids Next.js build-time inlining of secret values. */
function readEnv(name: string): string {
  const env = process.env as Record<string, string | undefined>;
  return env[name]?.trim() ?? "";
}

function parseSearchQueries(raw: string): string[] {
  return raw
    .split(/[|,]/)
    .map((q) => q.trim())
    .filter(Boolean)
    .filter((q) => q.length <= LINKEDIN_MAX_QUERY_LENGTH);
}

function parseIntEnv(name: string, fallback: number, min: number, max?: number): number {
  const parsed = Number.parseInt(readEnv(name), 10);
  const value = Number.isNaN(parsed) ? fallback : parsed;
  const clamped = Math.max(min, value);
  return max === undefined ? clamped : Math.min(max, clamped);
}

function parseFloatEnv(name: string, fallback: number, min: number): number {
  const parsed = Number.parseFloat(readEnv(name));
  const value = Number.isNaN(parsed) ? fallback : parsed;
  return Math.max(min, value);
}

export interface RoleLinkedInConfig {
  searchQueries: string[];
  cacheFile: string;
}

export interface LinkedInConfig {
  apifyToken: string;
  apifyActorId: string;
  apifyBaseUrl: string;
  postedLimit: PostedLimit;
  maxPostsPerFetch: number;
  maxResults: number;
  minExperienceYears: number;
  fetchIntervalHours: number;
}

export function getLinkedInConfig(): LinkedInConfig {
  const postedLimit = readEnv("LINKEDIN_POSTED_LIMIT") || "week";

  return {
    apifyToken: readEnv("APIFY_API_TOKEN"),
    apifyActorId: readEnv("APIFY_ACTOR_ID") || "harvestapi~linkedin-post-search",
    apifyBaseUrl: readEnv("APIFY_BASE_URL") || "https://api.apify.com",
    postedLimit: postedLimit as PostedLimit,
    maxPostsPerFetch: parseIntEnv("LINKEDIN_MAX_POSTS_PER_FETCH", 50, 1, 50),
    maxResults: parseIntEnv("LINKEDIN_MAX_RESULTS", 50, 1, 50),
    minExperienceYears: parseFloatEnv("LINKEDIN_MIN_EXPERIENCE_YEARS", 2.5, 0),
    fetchIntervalHours: parseIntEnv("LINKEDIN_FETCH_INTERVAL_HOURS", 6, 1),
  };
}

export function getRoleLinkedInConfig(role: JobRole): RoleLinkedInConfig {
  if (role === "qa") {
    const queries = readEnv("LINKEDIN_QA_SEARCH_QUERIES");
    return {
      searchQueries: parseSearchQueries(
        queries || DEFAULT_QA_SEARCH_QUERIES.join(","),
      ),
      cacheFile: readEnv("LINKEDIN_QA_CACHE_FILE") || "data/linkedin-posts-qa.json",
    };
  }

  const queries = readEnv("LINKEDIN_SEARCH_QUERIES");
  return {
    searchQueries: parseSearchQueries(
      queries || DEFAULT_FRONTEND_SEARCH_QUERIES.join(","),
    ),
    cacheFile: readEnv("LINKEDIN_CACHE_FILE") || "data/linkedin-posts.json",
  };
}

export function isLinkedInConfigured(): boolean {
  return Boolean(getLinkedInConfig().apifyToken);
}
