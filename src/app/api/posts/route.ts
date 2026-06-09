import { NextResponse } from "next/server";
import { getLinkedInPosts } from "@/features/linkedin/service";
import type { JobRole } from "@/features/posts/types";

function parseJobRole(value: string | null): JobRole {
  return value === "qa" ? "qa" : "frontend";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get("refresh") === "true";
  const role = parseJobRole(searchParams.get("role"));

  try {
    const result = await getLinkedInPosts({ refresh, role });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch LinkedIn posts";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
