import {
  FRONTEND_ROLE_PATTERNS,
  HIRING_KEYWORDS,
  QA_HIRING_KEYWORDS,
  QA_ROLE_PATTERNS,
} from "./constants";
import type { JobRole } from "./types";

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

const STRUCTURED_ROLE_PATTERNS: RegExp[] = [
  /(?:we(?:'re| are)\s+)?hiring\s*(?:alert\s*)?[|:–-]\s*([^|\n]+)/i,
  /(?:job\s*title|role|position|opening)\s*[:：📌]\s*([^\n]+)/i,
  /open\s*role\s*[:：]\s*([^\n]+)/i,
  /#hiring\s+([^\n]+)/i,
  /hiring\s+for\s*:\s*([^\n]+)/i,
  /\((frontend\s+(?:developer|engineer)|react\s+(?:developer|engineer)|full[\s-]?stack\s+(?:developer|engineer)|ui\s+(?:developer|engineer)|web\s+(?:developer|engineer)|qa\s+(?:engineer|analyst|lead)|sdet|test\s+automation\s+(?:engineer|developer))[^)]*\)/i,
  /(?:looking\s+for|seeking)\s+(?:a\s+)?(?:an\s+)?(?:talented\s+)?([A-Za-z][^\n.]{2,80}?)(?:\s+to\s+join|\s+at\s+|\n|\.)/i,
];

function cleanRoleText(text: string): string {
  return text
    .replace(EMOJI_REGEX, "")
    .replace(/\s+/g, " ")
    .replace(/^[-–•\s]+/, "")
    .replace(/\s*(?:at|@)\s+.+$/i, "")
    .replace(/\s*(?:location|experience|📍|💼)\s*[:：].+$/i, "")
    .replace(/[|•]+$/, "")
    .trim();
}

function getRoleKeywords(jobRole: JobRole) {
  return jobRole === "qa" ? QA_HIRING_KEYWORDS : HIRING_KEYWORDS;
}

function getRolePatterns(jobRole: JobRole) {
  return jobRole === "qa" ? QA_ROLE_PATTERNS : FRONTEND_ROLE_PATTERNS;
}

function isTargetRole(text: string, jobRole: JobRole): boolean {
  const lower = text.toLowerCase();
  const keywords = getRoleKeywords(jobRole);
  if (keywords.some((keyword) => lower.includes(keyword))) return true;
  return getRolePatterns(jobRole).some((pattern) => pattern.test(text));
}

function pickRoleFromList(text: string, jobRole: JobRole): string | null {
  const parts = text.split(/[,/&]|\band\b/i);

  for (const part of parts) {
    const cleaned = cleanRoleText(part);
    if (!cleaned) continue;

    if (isTargetRole(cleaned, jobRole)) {
      for (const pattern of getRolePatterns(jobRole)) {
        const match = cleaned.match(pattern);
        if (match) return match[0].trim();
      }
      return cleaned;
    }
  }

  return null;
}

function findBestPatternMatch(content: string, jobRole: JobRole): string | null {
  let bestMatch = "";

  for (const pattern of getRolePatterns(jobRole)) {
    const match = content.match(pattern);
    if (match && match[0].length > bestMatch.length) {
      bestMatch = match[0];
    }
  }

  return bestMatch || null;
}

function formatRoleName(role: string): string {
  const trimmed = role.trim().replace(/\s+/g, " ");
  const preserve: Record<string, string> = {
    react: "React",
    "react.js": "React.js",
    "next.js": "Next.js",
    nextjs: "Next.js",
    typescript: "TypeScript",
    javascript: "JavaScript",
    "node.js": "Node.js",
    ui: "UI",
    ux: "UX",
    sde: "SDE",
    sdet: "SDET",
    qa: "QA",
    ii: "II",
    mern: "MERN",
    mean: "MEAN",
  };

  return trimmed
    .split(" ")
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (preserve[lower]) return preserve[lower];
      if (index > 0 && ["of", "and", "the"].includes(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function defaultRoleName(jobRole: JobRole): string {
  return jobRole === "qa" ? "QA / SDET Engineer" : "Frontend Engineer";
}

export function extractRoleName(
  content: string,
  matchedKeywords: string[] = [],
  jobRole: JobRole = "frontend",
): string {
  for (const pattern of STRUCTURED_ROLE_PATTERNS) {
    const match = content.match(pattern);
    if (!match?.[1]) continue;

    const raw = cleanRoleText(match[1]);
    if (!raw) continue;

    const fromList = pickRoleFromList(raw, jobRole);
    if (fromList) return formatRoleName(fromList);

    if (isTargetRole(raw, jobRole)) {
      for (const rolePattern of getRolePatterns(jobRole)) {
        const roleMatch = raw.match(rolePattern);
        if (roleMatch) return formatRoleName(roleMatch[0]);
      }
      return formatRoleName(raw);
    }
  }

  const patternMatch = findBestPatternMatch(content, jobRole);
  if (patternMatch) return formatRoleName(patternMatch);

  if (matchedKeywords.length > 0) {
    const sorted = [...matchedKeywords].sort((a, b) => b.length - a.length);
    return formatRoleName(sorted[0]);
  }

  return defaultRoleName(jobRole);
}
