import "server-only";

import { getRoleLinkedInConfig, getLinkedInConfig, isLinkedInConfigured } from "./config";
import { mapLinkedInPosts } from "./mapper";
import type { ApifyLinkedInPost } from "./types";
import type { JobRole, RawPost } from "@/features/posts/types";

function buildActorInput(
  limit: number,
  searchQueries: string[],
): Record<string, unknown> {
  const config = getLinkedInConfig();
  const actorId = config.apifyActorId.toLowerCase();
  const queries =
    searchQueries.length > 0 ? searchQueries : ["hiring frontend engineer"];

  if (actorId.includes("harvestapi") || actorId.includes("linkedin-post-search")) {
    const activeQueries = queries.slice(0, 3);
    const maxPostsPerQuery = Math.max(
      5,
      Math.ceil(limit / Math.max(1, activeQueries.length)),
    );

    return {
      searchQueries: activeQueries,
      maxPosts: maxPostsPerQuery,
      postedLimit: config.postedLimit,
      sortBy: "date",
      scrapeReactions: false,
      scrapeComments: false,
    };
  }

  if (actorId.includes("curious_coder")) {
    const keyword = encodeURIComponent(queries[0] ?? "hiring frontend engineer");
    return {
      urls: [
        `https://www.linkedin.com/search/results/content/?datePosted=%22past-week%22&keywords=${keyword}&origin=FACETED_SEARCH`,
      ],
      maxPosts: limit,
    };
  }

  throw new Error(
    `Unsupported Apify actor "${config.apifyActorId}". Use harvestapi~linkedin-post-search for LinkedIn posts.`,
  );
}

function dedupeAndSortByDate(posts: RawPost[], limit: number): RawPost[] {
  const byId = new Map<string, RawPost>();

  for (const post of posts) {
    byId.set(post.postId, post);
  }

  return [...byId.values()]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, limit);
}

function filterApifyItems(items: unknown[], hardCap: number): ApifyLinkedInPost[] {
  const posts: ApifyLinkedInPost[] = [];

  for (const item of items) {
    if (posts.length >= hardCap) break;
    if (typeof item !== "object" || item === null) continue;

    const record = item as ApifyLinkedInPost;
    if (record.type && record.type !== "post") continue;

    posts.push(record);
  }

  return posts;
}

export async function fetchLinkedInPostsFromApify(
  limit: number,
  role: JobRole = "frontend",
): Promise<RawPost[]> {
  if (!isLinkedInConfigured()) {
    throw new Error(
      "APIFY_API_TOKEN is not set. Add it to JobFinder/.env.local (see .env.example).",
    );
  }

  if (limit <= 0) {
    return [];
  }

  const config = getLinkedInConfig();
  const { searchQueries } = getRoleLinkedInConfig(role);
  const actorId = encodeURIComponent(config.apifyActorId);
  const url = `${config.apifyBaseUrl}/v2/acts/${actorId}/run-sync-get-dataset-items?token=${config.apifyToken}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildActorInput(limit, searchQueries)),
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Apify LinkedIn post fetch failed (${response.status}): ${detail.slice(0, 400)}`,
    );
  }

  const items = (await response.json()) as unknown[];
  const postItems = filterApifyItems(items ?? [], limit * 2);
  const mapped = mapLinkedInPosts(postItems);

  return dedupeAndSortByDate(mapped, limit);
}
