import type { MailPlaceholders, MailTemplate } from "./types";

const PLACEHOLDER_MAP: Record<string, keyof MailPlaceholders> = {
  "{{ROLE_NAME}}": "roleName",
  "{{APPLICANT_NAME}}": "applicantName",
  "{{HIRING_MANAGER_NAME}}": "hiringManagerName",
  "{{HIRING_MANAGER_NAME / HIRING_TEAM}}": "hiringManagerName",
  "{{COMPANY_NAME}}": "companyName",
  "{{WHY_THIS_ROLE_INTERESTS_YOU}}": "whyThisRoleInterestsYou",
  "{{COMPANY_SPECIFIC_REASON}}": "companySpecificReason",
};

const LINK_PLACEHOLDERS: Record<
  string,
  { urlKey: keyof MailPlaceholders; label: string }
> = {
  "{{LINKEDIN_URL}}": { urlKey: "linkedinUrl", label: "LinkedIn" },
  "{{PORTFOLIO_URL}}": { urlKey: "portfolioUrl", label: "Portfolio" },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatLink(
  url: string,
  label: string,
  format: "plain" | "html",
): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (format === "html") {
    return `<a href="${escapeHtml(trimmed)}">${escapeHtml(label)}</a>`;
  }

  return `${label}: ${trimmed}`;
}

export function fillTemplate(
  template: string,
  placeholders: MailPlaceholders,
  format: "plain" | "html" = "plain",
): string {
  let result = template;

  for (const [token, { urlKey, label }] of Object.entries(LINK_PLACEHOLDERS)) {
    result = result.split(token).join(
      formatLink(String(placeholders[urlKey] ?? ""), label, format),
    );
  }

  for (const [token, key] of Object.entries(PLACEHOLDER_MAP)) {
    result = result.split(token).join(placeholders[key] || "");
  }

  return result;
}

export function bodyHtmlToDisplay(html: string): string {
  return html.replace(/\n/g, "<br>");
}

export function buildFilledMail(
  template: MailTemplate,
  placeholders: MailPlaceholders,
) {
  return {
    subject: fillTemplate(template.subject, placeholders),
    body: fillTemplate(template.body, placeholders, "plain"),
    bodyHtml: fillTemplate(template.body, placeholders, "html"),
  };
}

const MAILTO_MAX_URL_LENGTH = 2000;

export function normalizeRecipientEmail(email: string): string {
  return email.trim().replace(/^<+|>+$/g, "").trim();
}

function encodeMailtoParam(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function buildMailtoQuery(subject: string, body: string): string {
  const parts: string[] = [];
  if (subject) parts.push(`subject=${encodeMailtoParam(subject)}`);
  if (body) parts.push(`body=${encodeMailtoParam(body)}`);
  return parts.join("&");
}

export interface ComposeLink {
  url: string;
  bodyIncluded: boolean;
}

export function buildMailtoUrl(
  to: string,
  subject: string,
  body: string,
): ComposeLink | null {
  const recipient = normalizeRecipientEmail(to);
  if (!recipient || !recipient.includes("@")) return null;

  const fullQuery = buildMailtoQuery(subject, body);
  const fullUrl = fullQuery
    ? `mailto:${recipient}?${fullQuery}`
    : `mailto:${recipient}`;

  if (fullUrl.length <= MAILTO_MAX_URL_LENGTH) {
    return { url: fullUrl, bodyIncluded: Boolean(body) };
  }

  const subjectOnlyQuery = buildMailtoQuery(subject, "");
  const shortUrl = subjectOnlyQuery
    ? `mailto:${recipient}?${subjectOnlyQuery}`
    : `mailto:${recipient}`;

  return { url: shortUrl, bodyIncluded: false };
}

export function buildGmailComposeUrl(
  to: string,
  subject: string,
  body: string,
): ComposeLink | null {
  const recipient = normalizeRecipientEmail(to);
  if (!recipient || !recipient.includes("@")) return null;

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: recipient,
    su: subject,
    body,
  });

  return {
    url: `https://mail.google.com/mail/?${params.toString()}`,
    bodyIncluded: true,
  };
}

/** Must run synchronously inside a user click handler. */
export function openComposeLink(url: string, target: "_self" | "_blank" = "_self"): void {
  if (target === "_blank") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(url);
}

export async function copyToClipboard(
  text: string,
  html?: string,
): Promise<void> {
  if (html && typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
    return;
  }

  await navigator.clipboard.writeText(text);
}
