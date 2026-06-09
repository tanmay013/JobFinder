import { extractCompanyName } from "@/features/posts/company-extraction";
import { extractEmails } from "@/features/posts/processing";
import type { RawPost } from "@/features/posts/types";
import type { ApifyLinkedInPost, ApifyLinkedInPostAuthor } from "./types";

const MAX_CONTENT_LENGTH = 8_000;

function parsePostedAt(raw: ApifyLinkedInPost): string {
  if (raw.postedAt?.date) {
    const parsed = new Date(raw.postedAt.date);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  if (raw.postedAt?.timestamp) {
    return new Date(raw.postedAt.timestamp).toISOString();
  }

  const fallback = raw.createdAt ?? raw.publishedAt;
  if (fallback) {
    const parsed = new Date(fallback);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return new Date().toISOString();
}

function extractAuthorCompany(author?: ApifyLinkedInPostAuthor): string {
  if (!author) return "Unknown";

  if (author.type === "company" && author.name) {
    return author.name.trim();
  }

  if (author.info) {
    const atMatch = author.info.match(/\bat\s+([^|•,\n]+)/i);
    if (atMatch?.[1]) return atMatch[1].trim();
  }

  return author.name?.trim() || "Unknown";
}

function trimContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= MAX_CONTENT_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_CONTENT_LENGTH)}…`;
}

export function mapLinkedInPostToRawPost(
  raw: ApifyLinkedInPost,
): RawPost | null {
  if (raw.type && raw.type !== "post") return null;

  const content = raw.content ?? raw.text ?? raw.commentary ?? "";
  const postUrl = raw.linkedinUrl ?? raw.url;
  const authorName = raw.author?.name?.trim();

  if (!content.trim() || !postUrl || !authorName) return null;

  const trimmedContent = trimContent(content);
  const authorCompany = extractAuthorCompany(raw.author);
  const company = extractCompanyName(trimmedContent, {
    authorName: authorName,
    fallbackCompany: authorCompany,
    emails: extractEmails(trimmedContent),
  });

  return {
    postId: String(raw.id ?? postUrl),
    author: authorName,
    company,
    date: parsePostedAt(raw),
    postUrl: postUrl.trim(),
    content: trimContent(content),
  };
}

export function mapLinkedInPosts(posts: ApifyLinkedInPost[]): RawPost[] {
  return posts
    .map(mapLinkedInPostToRawPost)
    .filter((post): post is RawPost => post !== null);
}
