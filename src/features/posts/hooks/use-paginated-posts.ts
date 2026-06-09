"use client";

import { useMemo } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { PaginatedResult, ProcessedPost } from "../types";

export function usePaginatedPosts(): PaginatedResult<ProcessedPost> {
  const processedPosts = useDashboardStore((s) => s.processedPosts);
  const page = useDashboardStore((s) => s.page);
  const pageSize = useDashboardStore((s) => s.pageSize);

  return useMemo(() => {
    const totalItems = processedPosts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: processedPosts.slice(start, start + pageSize),
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    };
  }, [processedPosts, page, pageSize]);
}
