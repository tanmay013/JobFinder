import { fetchLinkedInPostsFromApify } from "./apify.service";
import {
  getNextFetchAt,
  hasLocalData,
  mergePosts,
  readCache,
  shouldFetchFromApify,
  writeCache,
} from "./cache";
import { isLinkedInConfigured, linkedInConfig } from "./config";
import type { LinkedInFetchMeta, LinkedInPostsResult } from "./types";
import type { JobRole, RawPost } from "@/features/posts/types";

interface GetLinkedInPostsOptions {
  /** Manual refresh — still serves local file if data exists and is fresh. */
  refresh?: boolean;
  role?: JobRole;
}

function buildMeta(
  lastFetchedAt: string | null,
  cached: boolean,
  totalStored: number,
): LinkedInFetchMeta {
  return {
    cached,
    lastFetchedAt,
    nextFetchAt: getNextFetchAt(lastFetchedAt),
    fetchIntervalHours: linkedInConfig.fetchIntervalHours,
    maxPostsPerFetch: linkedInConfig.maxPostsPerFetch,
    totalStored,
  };
}

function buildResult(
  posts: RawPost[],
  lastFetchedAt: string | null,
  cached: boolean,
): LinkedInPostsResult {
  return {
    posts,
    source: "linkedin",
    total: posts.length,
    meta: buildMeta(lastFetchedAt, cached, posts.length),
  };
}

async function fetchAndPersist(role: JobRole): Promise<LinkedInPostsResult> {
  const fetched = await fetchLinkedInPostsFromApify(
    linkedInConfig.maxPostsPerFetch,
    role,
  );

  const merged = mergePosts([], fetched, linkedInConfig.maxPostsPerFetch);

  const lastFetchedAt = new Date().toISOString();
  await writeCache({ posts: merged, lastFetchedAt }, role);

  return buildResult(merged, lastFetchedAt, false);
}

export async function getLinkedInPosts(
  options: GetLinkedInPostsOptions = {},
): Promise<LinkedInPostsResult> {
  if (!isLinkedInConfigured()) {
    throw new Error(
      "LinkedIn integration is not configured. Set APIFY_API_TOKEN in .env.local.",
    );
  }

  const { refresh = false, role = "frontend" } = options;
  const cache = await readCache(role);

  if (!shouldFetchFromApify(cache, refresh)) {
    return buildResult(cache.posts, cache.lastFetchedAt, true);
  }

  try {
    return await fetchAndPersist(role);
  } catch (error) {
    if (hasLocalData(cache)) {
      return buildResult(cache.posts, cache.lastFetchedAt, true);
    }

    throw error;
  }
}
