import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getRoleLinkedInConfig, getLinkedInConfig } from "./config";
import type { LinkedInCacheState } from "./types";
import type { JobRole, RawPost } from "@/features/posts/types";

const EMPTY_STATE: LinkedInCacheState = {
  posts: [],
  lastFetchedAt: null,
};

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.NETLIFY,
  );
}

/** Writable base directory — `/tmp` on Netlify/Lambda, project root locally. */
function getCacheBaseDir(): string {
  const custom = process.env.LINKEDIN_CACHE_DIR?.trim();
  if (custom) {
    return path.isAbsolute(custom) ? custom : path.join(process.cwd(), custom);
  }

  if (isServerlessRuntime()) {
    return path.join("/tmp", "job-finder");
  }

  return process.cwd();
}

function cachePath(role: JobRole): string {
  const file = getRoleLinkedInConfig(role).cacheFile;
  if (path.isAbsolute(file)) {
    return file;
  }
  return path.join(getCacheBaseDir(), file);
}

export function fetchIntervalMs(): number {
  return getLinkedInConfig().fetchIntervalHours * 60 * 60 * 1000;
}

export function hasLocalData(cache: LinkedInCacheState): boolean {
  return cache.posts.length > 0;
}

export function isCacheFresh(lastFetchedAt: string | null): boolean {
  if (!lastFetchedAt) return false;
  const elapsed = Date.now() - new Date(lastFetchedAt).getTime();
  return elapsed < fetchIntervalMs();
}

/** Decide whether to call Apify or serve from the local file. */
export function shouldFetchFromApify(
  cache: LinkedInCacheState,
  refresh: boolean,
): boolean {
  if (refresh) return true;
  if (!hasLocalData(cache)) return true;
  if (!isCacheFresh(cache.lastFetchedAt)) return true;
  return false;
}

export function getNextFetchAt(lastFetchedAt: string | null): string | null {
  if (!lastFetchedAt) return null;
  return new Date(
    new Date(lastFetchedAt).getTime() + fetchIntervalMs(),
  ).toISOString();
}

function normalizeCache(parsed: Record<string, unknown>): LinkedInCacheState {
  return {
    posts: Array.isArray(parsed.posts) ? (parsed.posts as RawPost[]) : [],
    lastFetchedAt:
      typeof parsed.lastFetchedAt === "string" ? parsed.lastFetchedAt : null,
  };
}

export async function readCache(
  role: JobRole = "frontend",
): Promise<LinkedInCacheState> {
  const candidates = [cachePath(role)];

  if (role === "frontend") {
    candidates.push(path.join(getCacheBaseDir(), "data", "linkedin-cache.json"));
  }

  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const state = normalizeCache(parsed);

      if (state.posts.length > 0) {
        return state;
      }
    } catch {
      continue;
    }
  }

  return { ...EMPTY_STATE };
}

export async function writeCache(
  state: LinkedInCacheState,
  role: JobRole = "frontend",
): Promise<void> {
  const file = cachePath(role);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(state, null, 2), "utf-8");
}

export function mergePosts(
  existing: RawPost[],
  incoming: RawPost[],
  maxTotal: number,
): RawPost[] {
  const byId = new Map<string, RawPost>();

  for (const post of existing) {
    byId.set(post.postId, post);
  }

  for (const post of incoming) {
    byId.set(post.postId, post);
  }

  return [...byId.values()]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, maxTotal);
}
