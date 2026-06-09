import { NextResponse } from "next/server";
import { readCache } from "@/features/linkedin/cache";
import { getLinkedInConfig } from "@/features/linkedin/config";
import { computeStats, processPosts } from "@/features/posts/processing";
import type { PostFilters, RawPost } from "@/features/posts/types";

interface ProcessRequestBody {
  posts?: RawPost[];
  filters: PostFilters;
  source?: "linkedin" | "upload" | "api";
}

const MAX_UPLOAD_POSTS = 200;

function isValidPost(post: unknown): post is RawPost {
  if (typeof post !== "object" || post === null) return false;
  const record = post as Record<string, unknown>;
  return (
    typeof record.postId === "string" &&
    typeof record.author === "string" &&
    typeof record.content === "string" &&
    typeof record.date === "string" &&
    typeof record.company === "string" &&
    typeof record.postUrl === "string"
  );
}

function normalizeFilters(filters: PostFilters): PostFilters {
  return {
    jobRole: filters.jobRole === "qa" ? "qa" : "frontend",
    roleKeyword: filters.roleKeyword ?? "",
    experienceRange: filters.experienceRange ?? "2.5+",
    postedDateFrom: filters.postedDateFrom ?? null,
    postedDateTo: filters.postedDateTo ?? null,
    requireEmail: filters.requireEmail ?? false,
  };
}

async function resolvePosts(body: ProcessRequestBody): Promise<RawPost[]> {
  const jobRole = body.filters?.jobRole === "qa" ? "qa" : "frontend";

  if (body.source === "linkedin" || !body.posts) {
    const cache = await readCache(jobRole);
    return cache.posts;
  }

  if (!Array.isArray(body.posts)) {
    return [];
  }

  return body.posts
    .filter(isValidPost)
    .slice(0, MAX_UPLOAD_POSTS);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProcessRequestBody;

    if (!body.filters || typeof body.filters !== "object") {
      return NextResponse.json(
        { error: "filters are required" },
        { status: 400 },
      );
    }

    const posts = await resolvePosts(body);
    const filters = normalizeFilters(body.filters);

    const processed = processPosts(
      posts,
      filters,
      getLinkedInConfig().maxResults,
    );
    const stats = computeStats(processed);

    return NextResponse.json({
      posts: processed,
      stats,
      source: body.source ?? "api",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process posts";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
