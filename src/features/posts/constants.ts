/** Roles we want to keep — substring matches. */
export const HIRING_KEYWORDS = [
  "senior frontend engineer",
  "senior frontend developer",
  "lead frontend engineer",
  "frontend developer",
  "frontend engineer",
  "front-end developer",
  "front end developer",
  "react developer",
  "react js developer",
  "react.js developer",
  "reactjs developer",
  "javascript engineer",
  "javascript developer",
  "typescript developer",
  "typescript engineer",
  "ui engineer",
  "ui developer",
  "web engineer",
  "web developer",
  "full stack developer",
  "fullstack developer",
  "full-stack developer",
  "full stack engineer",
  "mern stack developer",
  "mean stack developer",
  "next.js developer",
  "nextjs developer",
  "software engineer frontend",
  "software developer frontend",
  "sde frontend",
  "sde ii frontend",
] as const;

/** Flexible patterns for LinkedIn post titles and descriptions. */
export const FRONTEND_ROLE_PATTERNS = [
  /\bfrontend\s+(developer|engineer)\b/i,
  /\bfront[\s-]end\s+(developer|engineer)\b/i,
  /\bui\s+(developer|engineer)\b/i,
  /\bweb\s+(developer|engineer)\b/i,
  /\breact\.?js\s+(developer|engineer)\b/i,
  /\breact\s+(developer|engineer)\b/i,
  /\bjavascript\s+(developer|engineer)\b/i,
  /\btypescript\s+(developer|engineer)\b/i,
  /\bfull[\s-]?stack\s+(developer|engineer)\b/i,
  /\bmern\s+stack\s+(developer|engineer)\b/i,
  /\bmean\s+stack\s+(developer|engineer)\b/i,
  /\bnext\.?js\s+(developer|engineer)\b/i,
  /\bangular\s+(developer|engineer)\b/i,
  /\bvue\.?js\s+(developer|engineer)\b/i,
  /\breact\s+native\s+developer\b/i,
  /\bsde\s+(ii\s+)?frontend\b/i,
  /software\s+engineer[\s,\-–(]*front[\s-]?end/i,
  /senior\s+software\s+engineer[\s,\-–(]*front[\s-]?end/i,
  /\bsoftware\s+(engineer|developer)\b[^.\n]{0,120}\b(react|frontend|javascript|typescript|next\.?js)\b/i,
  /\b(react|frontend|javascript|typescript|next\.?js)\b[^.\n]{0,120}\bsoftware\s+(engineer|developer)\b/i,
] as const;

/** Drop fresher, internship, and junior (1–2 yr) posts. */
export const EXCLUDE_KEYWORDS = [
  "fresher",
  "freshers",
  "internship",
  "unpaid internship",
  "paid internship",
  "tech internship",
  "summer intern",
  "entry level",
  "entry-level",
  "graduate program",
  "graduate trainee",
  "campus hiring",
  "campus recruitment",
  "for students",
  "college students",
  "0-1 year",
  "0-2 year",
  "1-2 year",
  "1–2 year",
  "6 months - 1 year",
  "6 months – 1 year",
] as const;

export const EXCLUDE_PATTERNS = [
  /\binternship(s)?\b/i,
  /\bunpaid\b/i,
  /\bintern\b/i,
  /\bfresher(s)?\b/i,
  /\bentry[\s-]level\b/i,
  /\bgraduate\s+trainee\b/i,
  /\btrainee\s+program\b/i,
  /\bcampus\s+(hiring|placement|recruitment)\b/i,
  /\b0\s*[-–]\s*1\s*years?\b/i,
  /\b0\s*[-–]\s*2\s*years?\b/i,
  /\b1\s*[-–]\s*2\s*years?\b/i,
  /\b1\s*[-–]\s*3\s*years?\b/i,
  /\b6\s*months?\s*[-–]\s*1\s*year\b/i,
  /\b6\s*months?\s*[-–]\s*2\s*years?\b/i,
  /experience\s*[:：]\s*0\s*[-–]\s*\d/i,
  /experience\s*[:：]\s*1\s*[-–]\s*2/i,
  /experience\s*[:：]\s*6\s*months/i,
  /💼\s*experience\s*[:：]\s*(?:6\s*months|0|1\s*[-–])/i,
  /\bmin(?:imum)?\s+(?:of\s+)?[01]\s*[-–]\s*[23]\s*years?\b/i,
] as const;

/** Default minimum years of experience for matching posts. */
export const MIN_EXPERIENCE_YEARS = 2.5;

/** Max processed posts returned to the dashboard. */
export const MAX_PROCESSED_POSTS = 50;

export const EXPERIENCE_SIGNALS = [
  { pattern: /\b3\+\s*years?\b/i, label: "3+ years", weight: 15 },
  { pattern: /\b3\s*[-–]\s*5\s*years?\b/i, label: "3-5 years", weight: 14 },
  { pattern: /\b2\.5\+\s*years?\b/i, label: "2.5+ years", weight: 13 },
  { pattern: /\b2\s*[-–]\s*4\s*years?\b/i, label: "2-4 years", weight: 12 },
  { pattern: /\b3\s*years?\b/i, label: "3 years", weight: 10 },
  { pattern: /\bmid[- ]?level\s+frontend\b/i, label: "mid-level frontend", weight: 8 },
] as const;

export const EXPERIENCE_RANGE_PATTERNS: Record<
  Exclude<import("./types").ExperienceRange, "all">,
  RegExp
> = {
  "2.5+":
    /\b2\.5\+\s*years?\b|\b(?:[3-9]|\d{2,})\+?\s*years?\b|\b[3-9]\s*[-–]\s*\d+\s*years?\b/i,
  "2-4": /\b2\s*[-–]\s*4\s*years?\b/i,
  "3+": /\b3\+\s*years?\b|\b3\s*or\s*more\s*years?\b/i,
  "3-5": /\b3\s*[-–]\s*5\s*years?\b/i,
  "mid-level": /\bmid[- ]?level\s+frontend\b/i,
};

/** QA / SDET roles we want to keep — substring matches. */
export const QA_HIRING_KEYWORDS = [
  "qa engineer",
  "qa automation engineer",
  "qa analyst",
  "qa lead",
  "sdet",
  "sdet engineer",
  "software development engineer in test",
  "quality assurance engineer",
  "quality assurance analyst",
  "test automation engineer",
  "automation tester",
  "automation engineer",
  "manual tester",
  "selenium automation engineer",
  "playwright automation engineer",
  "cypress automation engineer",
  "senior qa engineer",
  "senior sdet",
  "lead qa engineer",
  "lead sdet",
] as const;

/** Flexible patterns for QA / SDET hiring posts. */
export const QA_ROLE_PATTERNS = [
  /\bqa\s+(?:automation\s+)?(?:engineer|analyst|lead|manager)\b/i,
  /\bquality\s+assurance\s+(?:engineer|analyst|lead|manager)\b/i,
  /\bsdet\b/i,
  /\bsoftware\s+development\s+engineer\s+in\s+test\b/i,
  /\btest\s+automation\s+(?:engineer|developer|architect)\b/i,
  /\bautomation\s+(?:tester|engineer|qa)\b/i,
  /\bmanual\s+(?:tester|qa\s+engineer)\b/i,
  /\b(?:senior|lead|staff)\s+(?:qa|sdet)\b/i,
  /\b(?:selenium|playwright|cypress|appium)\s+(?:automation\s+)?(?:engineer|tester|developer)\b/i,
] as const;

export const DEFAULT_PAGE_SIZE = 10;
