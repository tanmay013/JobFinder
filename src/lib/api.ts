import type {
  DataSource,
  JobRole,
  PostFilters,
  PostsApiResponse,
  ProcessedPostsResponse,
  RawPost,
} from "@/features/posts/types";

export async function fetchLinkedInPosts(
  refresh = false,
  role: JobRole = "frontend",
): Promise<PostsApiResponse> {
  const params = new URLSearchParams();
  if (refresh) params.set("refresh", "true");
  if (role === "qa") params.set("role", "qa");

  const query = params.toString();
  const url = query ? `/api/posts?${query}` : "/api/posts";
  const response = await fetch(url);

  const data = (await response.json()) as PostsApiResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch LinkedIn posts");
  }

  return data;
}

export async function processPostsRequest(
  filters: PostFilters,
  options?: { posts?: RawPost[]; source?: DataSource },
): Promise<ProcessedPostsResponse> {
  const response = await fetch("/api/posts/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filters,
      source: options?.source,
      posts: options?.posts,
    }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Failed to process posts");
  }

  return response.json() as Promise<ProcessedPostsResponse>;
}

export function parseUploadedJson(text: string): RawPost[] {
  const parsed: unknown = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error("JSON file must contain an array of posts");
  }

  return parsed.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Invalid post at index ${index}`);
    }

    const record = item as Record<string, unknown>;
    const required = [
      "postId",
      "author",
      "content",
      "date",
      "company",
      "postUrl",
    ] as const;

    for (const key of required) {
      if (typeof record[key] !== "string" || !record[key]) {
        throw new Error(`Post at index ${index} is missing "${key}"`);
      }
    }

    return {
      postId: record.postId as string,
      author: record.author as string,
      content: record.content as string,
      date: record.date as string,
      company: record.company as string,
      postUrl: record.postUrl as string,
    };
  });
}
