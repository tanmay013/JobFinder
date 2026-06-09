import { resolveCompanyName } from "./company-extraction";
import { extractRoleName } from "./role-extraction";
import {
  EXCLUDE_KEYWORDS,
  EXCLUDE_PATTERNS,
  EXPERIENCE_RANGE_PATTERNS,
  EXPERIENCE_SIGNALS,
  FRONTEND_ROLE_PATTERNS,
  HIRING_KEYWORDS,
  MAX_PROCESSED_POSTS,
  MIN_EXPERIENCE_YEARS,
  QA_HIRING_KEYWORDS,
  QA_ROLE_PATTERNS,
} from "./constants";
import type {
  DashboardStats,
  ExperienceRange,
  JobRole,
  PostFilters,
  ProcessedPost,
  RawPost,
} from "./types";

const JUNK_EMAIL =
  /noreply|no-reply|donotreply|mailer-daemon|example\.com|linkedin\.com|@users\.|sentry\./i;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const MIN_YEARS_PATTERNS: RegExp[] = [
  /(?:experience|exp)\s*[:：]\s*(\d+(?:\.\d+)?)\s*\+\s*years?/i,
  /(?:experience|exp)\s*[:：]\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*years?/i,
  /💼\s*experience\s*[:：]\s*(\d+(?:\.\d+)?)\s*\+\s*years?/i,
  /💼\s*experience\s*[:：]\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*years?/i,
  /\b(\d+(?:\.\d+)?)\s*\+\s*years?\s+(?:of\s+)?experience/i,
  /\bmin(?:imum)?\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*years?/i,
  /\b(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*years?\s+(?:of\s+)?experience/i,
  /\b(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*yrs?\b/i,
  /experience\s*[:：]\s*(\d+(?:\.\d+)?)\s*years?/i,
];

function deobfuscate(text: string): string {
  return text
    .replace(/\[\s*at\s*\]/gi, "@")
    .replace(/\(\s*at\s*\)/gi, "@")
    .replace(/\[\s*dot\s*\]/gi, ".")
    .replace(/\(\s*dot\s*\)/gi, ".");
}

function isValidEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (JUNK_EMAIL.test(lower)) return false;
  if (lower.length > 254) return false;
  const [local, domain] = lower.split("@");
  if (!local || !domain || !domain.includes(".")) return false;
  return true;
}

export function extractEmails(content: string): string[] {
  if (!content.includes("@")) return [];

  const normalized = deobfuscate(content);
  const matches = normalized.match(EMAIL_REGEX) ?? [];
  const found = new Set<string>();

  for (const raw of matches) {
    const email = raw.replace(/[>,;.)]+$/, "").toLowerCase();
    if (isValidEmail(email)) found.add(email);
  }

  return [...found];
}

function pickPrimaryEmail(emails: string[]): string | undefined {
  const hrLike = emails.find((e) =>
    /hr|recruit|career|hiring|talent|jobs|apply|contact/i.test(e),
  );
  return hrLike ?? emails[0];
}

function getRoleKeywords(jobRole: JobRole) {
  return jobRole === "qa" ? QA_HIRING_KEYWORDS : HIRING_KEYWORDS;
}

function getRolePatterns(jobRole: JobRole) {
  return jobRole === "qa" ? QA_ROLE_PATTERNS : FRONTEND_ROLE_PATTERNS;
}

function findMatchedKeywords(
  content: string,
  jobRole: JobRole,
  roleKeyword?: string,
): string[] {
  const lower = content.toLowerCase();
  const baseKeywords = getRoleKeywords(jobRole);
  const keywords = roleKeyword?.trim()
    ? [roleKeyword.trim().toLowerCase(), ...baseKeywords]
    : [...baseKeywords];

  const unique = [...new Set(keywords)];
  const matched = unique.filter((kw) => lower.includes(kw));

  for (const pattern of getRolePatterns(jobRole)) {
    const match = content.match(pattern);
    if (match) {
      matched.push(match[0].toLowerCase());
    }
  }

  return [...new Set(matched)];
}

export function isExcludedPost(content: string): boolean {
  const lower = content.toLowerCase();

  if (EXCLUDE_KEYWORDS.some((kw) => lower.includes(kw))) {
    return true;
  }

  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(content));
}

/** Parse the minimum years of experience explicitly stated in a post. */
export function getMinimumRequiredYears(content: string): number | null {
  const found: number[] = [];

  for (const pattern of MIN_YEARS_PATTERNS) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;

    for (const match of content.matchAll(new RegExp(pattern.source, flags))) {
      const first = Number.parseFloat(match[1]);
      if (!Number.isNaN(first)) found.push(first);
    }
  }

  if (found.length === 0) return null;
  return Math.min(...found);
}

export function meetsMinExperience(
  content: string,
  minYears = MIN_EXPERIENCE_YEARS,
): boolean {
  const required = getMinimumRequiredYears(content);
  if (required === null) return true;
  return required >= minYears;
}

export function isHiringPost(
  content: string,
  jobRole: JobRole = "frontend",
  roleKeyword?: string,
): {
  isHiring: boolean;
  matchedKeywords: string[];
} {
  if (isExcludedPost(content)) {
    return { isHiring: false, matchedKeywords: [] };
  }

  const matchedKeywords = findMatchedKeywords(content, jobRole, roleKeyword);
  const isTargetRole = matchedKeywords.length > 0;

  return {
    isHiring: isTargetRole,
    matchedKeywords,
  };
}

export function computeRelevanceScore(
  content: string,
  matchedKeywords: string[],
  jobRole: JobRole = "frontend",
): { score: number; experienceSignals: string[] } {
  let score = matchedKeywords.length * 10;
  const experienceSignals: string[] = [];

  for (const signal of EXPERIENCE_SIGNALS) {
    if (signal.pattern.test(content)) {
      score += signal.weight;
      experienceSignals.push(signal.label);
    }
  }

  if (/\b(senior|sr\.?)\b/i.test(content)) score += 5;

  if (jobRole === "qa") {
    if (/\b(selenium|playwright|cypress|appium|testng|junit)\b/i.test(content)) {
      score += 3;
    }
  } else if (/\b(react|next\.?js|typescript)\b/i.test(content)) {
    score += 3;
  }

  return { score: Math.min(score, 100), experienceSignals };
}

function matchesExperienceRange(
  content: string,
  range: ExperienceRange,
): boolean {
  if (range === "all") return true;
  if (range === "2.5+") return meetsMinExperience(content, MIN_EXPERIENCE_YEARS);
  return EXPERIENCE_RANGE_PATTERNS[range].test(content);
}

function matchesDateRange(
  dateStr: string,
  from: string | null,
  to: string | null,
): boolean {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return true;

  if (from) {
    const fromDate = new Date(from);
    if (date < fromDate) return false;
  }

  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (date > toDate) return false;
  }

  return true;
}

export function processPost(raw: RawPost, filters: PostFilters): ProcessedPost | null {
  const { isHiring, matchedKeywords } = isHiringPost(
    raw.content,
    filters.jobRole,
    filters.roleKeyword,
  );
  if (!isHiring) return null;

  if (!meetsMinExperience(raw.content, MIN_EXPERIENCE_YEARS)) {
    return null;
  }

  const emails = extractEmails(raw.content);
  const email = pickPrimaryEmail(emails);

  if (filters.requireEmail && (!email || emails.length === 0)) {
    return null;
  }

  if (!matchesExperienceRange(raw.content, filters.experienceRange)) {
    return null;
  }

  if (
    !matchesDateRange(raw.date, filters.postedDateFrom, filters.postedDateTo)
  ) {
    return null;
  }

  const { score, experienceSignals } = computeRelevanceScore(
    raw.content,
    matchedKeywords,
    filters.jobRole,
  );

  const roleName = extractRoleName(
    raw.content,
    matchedKeywords,
    filters.jobRole,
  );
  const company = resolveCompanyName(
    raw.content,
    raw.author,
    raw.company,
    emails,
  );

  return {
    postId: raw.postId,
    author: raw.author,
    content: raw.content,
    date: raw.date,
    company,
    postUrl: raw.postUrl,
    email: email ?? "",
    emails,
    roleName,
    relevanceScore: score,
    matchedKeywords,
    experienceSignals,
  };
}

export function processPosts(
  rawPosts: RawPost[],
  filters: PostFilters,
  maxResults = MAX_PROCESSED_POSTS,
): ProcessedPost[] {
  return rawPosts
    .map((post) => processPost(post, filters))
    .filter((post): post is ProcessedPost => post !== null)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, maxResults);
}

export function computeStats(posts: ProcessedPost[]): DashboardStats {
  const companies = new Set(
    posts.map((p) => p.company.trim().toLowerCase()).filter(Boolean),
  );

  return {
    totalPosts: posts.length,
    postsWithEmail: posts.filter((p) => p.emails.length > 0).length,
    uniqueCompanies: companies.size,
  };
}
