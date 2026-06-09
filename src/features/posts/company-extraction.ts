const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

const COMPANY_SUFFIX =
  /\b(?:private\s+limited|pvt\.?\s*ltd\.?|ltd\.?|limited|inc\.?|incorporated|llp|llc|plc|corp\.?|corporation|solutions?|technologies|technocrew|infotech|consultancy|consulting|services?|group|international|enterprises?|systems?|software|labs?|studio|digital|global|india|infotech)\b/i;

const PERSON_NAME_PATTERN =
  /^[A-Z][a-z]+(?:\s+[A-Z][a-z.'-]+){0,3}$/;

const TECH_DOMAIN_WORDS = new Set([
  "springboot",
  "nodejs",
  "fullstack",
  "frontend",
  "backend",
  "react",
  "angular",
  "java",
  "python",
  "dotnet",
  "qatester",
  "uiuxdesigner",
  "systemadmin",
]);

const GENERIC_EMAIL_DOMAINS = new Set([
  "gmail",
  "googlemail",
  "yahoo",
  "hotmail",
  "outlook",
  "live",
  "icloud",
  "protonmail",
  "linkedin",
  "users",
  "mail",
  "rediffmail",
  "ymail",
]);

const CONTENT_PATTERNS: RegExp[] = [
  /^([^.\n]{3,100}?)\s+IS\s+HIRING/i,
  /Hiring\s+at\s+([^|,\n]+)/i,
  /(?:We(?:'re|'re|\s+are)\s+)?Hiring\s+[^@\n]{0,120}?\bat\s+([^,\n(]+)/i,
  /([^.\n]{3,80}?)\s+is\s+hiring/i,
  /join\s+(?:the\s+)?(?:our\s+)?(?:growing\s+)?team\s+at\s+([^,\n.]+)/i,
  /(?:opportunity|role|position)\s+at\s+([^,\n.]+)/i,
  /(?:client|company)\s*[:：]\s*([^,\n]+)/i,
];

function cleanCompanyText(text: string): string {
  return text
    .replace(EMOJI_REGEX, "")
    .replace(/\s+/g, " ")
    .replace(/^[-–•*#@\s]+/, "")
    .replace(/\s*[-–|•]\s+.+$/, "")
    .replace(/\s*\(x\d+\)$/i, "")
    .trim();
}

function formatCompanyName(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => {
      const upper = word.toUpperCase();
      if (word.length > 1 && word === upper) return word;
      if (COMPANY_SUFFIX.test(word)) {
        const lower = word.toLowerCase();
        if (["pvt", "ltd", "inc", "llp", "llc", "plc", "corp"].includes(lower)) {
          return lower === "pvt" ? "Pvt" : lower.toUpperCase().replace(/\.$/, "") + ".";
        }
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bPvt\.\s+Ltd\./i, "Pvt. Ltd.")
    .trim();
}

function companyFromEmailDomain(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  const parts = domain.split(".").filter(Boolean);
  if (parts.length < 2) return null;

  const base =
    parts.length >= 3 && parts[parts.length - 2].length <= 3
      ? parts[parts.length - 3]
      : parts[0];

  if (
    !base ||
    GENERIC_EMAIL_DOMAINS.has(base) ||
    TECH_DOMAIN_WORDS.has(base) ||
    base.length < 3
  ) {
    return null;
  }

  const formatted = formatCompanyName(base.replace(/[-_]/g, " "));
  if (looksLikePersonName(formatted)) return null;

  return formatted;
}

function companyFromHashtags(content: string): string | null {
  const tags = [...content.matchAll(/#([A-Za-z][A-Za-z0-9]+)/g)].map((m) => m[1]);
  const skip = new Set([
    "hiring",
    "hiringnow",
    "techhiring",
    "jobs",
    "jobopening",
    "careers",
    "applynow",
    "immediatejoiners",
    "bangalorejobs",
    "remotejobs",
    "techjobs",
    "developerjobs",
    "frontenddeveloper",
    "backenddeveloper",
    "qatester",
    "qatesting",
    "react",
    "javascript",
    "linkedin",
    "springboot",
    "nodejs",
    "fullstack",
    "uiuxdesigner",
    "systemadmin",
  ]);

  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (skip.has(lower) || lower.length < 4) continue;
    if (/jobs?$|hiring|career|developer|engineer/i.test(tag)) continue;
    return formatCompanyName(tag);
  }

  return null;
}

function extractFromContent(content: string): string | null {
  const normalized = content.replace(EMOJI_REGEX, " ").trim();

  for (const pattern of CONTENT_PATTERNS) {
    const match = normalized.match(pattern);
    if (!match?.[1]) continue;

    const cleaned = cleanCompanyText(match[1]);
    if (cleaned.length < 3 || cleaned.length > 80) continue;
    if (looksLikePersonName(cleaned)) continue;
    if (/^(a|an|the)\s+/i.test(cleaned)) continue;

    return formatCompanyName(cleaned);
  }

  return null;
}

function looksLikeNameWord(word: string): boolean {
  return /^[A-Z][a-z.'-]+$/.test(word) || /^[A-Z]{2,}$/.test(word);
}

export function looksLikePersonName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (COMPANY_SUFFIX.test(trimmed)) return false;
  if (
    /\b(jobs?|hiring|careers|hub|program|consultancy|solutions|technologies|infotech|inc|ltd|codebox|quickflo)\b/i.test(
      trimmed,
    )
  ) {
    return false;
  }

  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;

  if (words.every(looksLikeNameWord)) return true;

  return PERSON_NAME_PATTERN.test(trimmed);
}

export function looksLikeCompanyName(name: string): boolean {
  if (!name.trim()) return false;
  if (COMPANY_SUFFIX.test(name)) return true;
  if (
    /\b(jobs?|hiring|careers|hub|inc|solutions|technologies|consultancy|services|infotech|engineering|digital|software|program|internship|bestkaam|codebox|quickflo|google|lenskart|percepto|coverizon|cognifyz)\b/i.test(
      name,
    )
  ) {
    return true;
  }
  return false;
}

function isCompanyPageName(name: string): boolean {
  return looksLikeCompanyName(name) && !looksLikePersonName(name);
}

export function extractCompanyName(
  content: string,
  options: {
    authorName?: string;
    fallbackCompany?: string;
    emails?: string[];
  } = {},
): string {
  const { authorName, fallbackCompany, emails = [] } = options;

  const fromContent = extractFromContent(content);
  if (fromContent) return fromContent;

  for (const email of emails) {
    const fromDomain = companyFromEmailDomain(email);
    if (fromDomain && !looksLikePersonName(fromDomain)) return fromDomain;
  }

  const fromHashtag = companyFromHashtags(content);
  if (fromHashtag) return fromHashtag;

  if (
    fallbackCompany &&
    fallbackCompany !== authorName &&
    looksLikeCompanyName(fallbackCompany)
  ) {
    return formatCompanyName(fallbackCompany);
  }

  return "Unknown";
}

export function resolveCompanyName(
  content: string,
  author: string,
  mappedCompany: string,
  emails: string[] = [],
): string {
  const isCompanyPage =
    mappedCompany === author && isCompanyPageName(mappedCompany);

  if (isCompanyPage) {
    return formatCompanyName(mappedCompany);
  }

  const shouldReextract =
    !mappedCompany ||
    mappedCompany === "Unknown" ||
    mappedCompany === author ||
    looksLikePersonName(mappedCompany);

  if (!shouldReextract) {
    return formatCompanyName(mappedCompany);
  }

  const resolved = extractCompanyName(content, {
    authorName: author,
    fallbackCompany: mappedCompany,
    emails,
  });

  if (resolved !== "Unknown") return resolved;

  return looksLikeCompanyName(mappedCompany)
    ? formatCompanyName(mappedCompany)
    : "Unknown";
}
