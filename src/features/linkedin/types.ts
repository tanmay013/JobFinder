import type { RawPost } from "@/features/posts/types";

export interface LinkedInCacheState {
  posts: RawPost[];
  lastFetchedAt: string | null;
}

export interface LinkedInFetchMeta {
  cached: boolean;
  lastFetchedAt: string | null;
  nextFetchAt: string | null;
  fetchIntervalHours: number;
  maxPostsPerFetch: number;
  totalStored: number;
}

export interface LinkedInPostsResult {
  posts: RawPost[];
  source: "linkedin";
  total: number;
  meta: LinkedInFetchMeta;
}

/** harvestapi/linkedin-post-search item shape (partial). */
export interface ApifyLinkedInPostAuthor {
  name?: string;
  type?: "profile" | "company" | string;
  info?: string;
  linkedinUrl?: string;
  universalName?: string;
}

export interface ApifyLinkedInPost {
  type?: string;
  id?: string;
  linkedinUrl?: string;
  url?: string;
  content?: string;
  text?: string;
  commentary?: string;
  author?: ApifyLinkedInPostAuthor;
  postedAt?: {
    date?: string;
    timestamp?: number;
  };
  createdAt?: string;
  publishedAt?: string;
}
