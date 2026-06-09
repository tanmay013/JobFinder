"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLinkedInPosts, processPostsRequest } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { PostFilters } from "../types";

export function useLinkedInPosts() {
  const jobRole = useDashboardStore((s) => s.filters.jobRole);
  const setRawPosts = useDashboardStore((s) => s.setRawPosts);
  const setLinkedInMeta = useDashboardStore((s) => s.setLinkedInMeta);
  const setFetchError = useDashboardStore((s) => s.setFetchError);
  return useQuery({
    queryKey: ["posts", "linkedin", jobRole],
    queryFn: async () => {
      try {
        const data = await fetchLinkedInPosts(false, jobRole);
        setRawPosts(data.posts, "linkedin");
        setLinkedInMeta(data.meta ?? null);
        setFetchError(null);

        return data;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch LinkedIn posts";
        setFetchError(message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useRefreshLinkedInPosts() {
  const queryClient = useQueryClient();
  const jobRole = useDashboardStore((s) => s.filters.jobRole);
  const setRawPosts = useDashboardStore((s) => s.setRawPosts);
  const setLinkedInMeta = useDashboardStore((s) => s.setLinkedInMeta);
  const setFetchError = useDashboardStore((s) => s.setFetchError);
  const filters = useDashboardStore((s) => s.filters);
  const setProcessedPosts = useDashboardStore((s) => s.setProcessedPosts);

  return useMutation({
    mutationFn: async () => {
      const data = await fetchLinkedInPosts(true, jobRole);
      const processed = await processPostsRequest(filters, {
        source: "linkedin",
      });
      return { data, processed };
    },
    onSuccess: ({ data, processed }) => {
      setRawPosts(data.posts, "linkedin");
      setLinkedInMeta(data.meta ?? null);
      setFetchError(null);
      setProcessedPosts(processed.posts);
      queryClient.setQueryData(["posts", "linkedin", jobRole], data);
    },
    onError: (error) => {
      setFetchError(
        error instanceof Error
          ? error.message
          : "Failed to refresh LinkedIn posts",
      );
    },
  });
}

export function useProcessPosts() {
  const setProcessedPosts = useDashboardStore((s) => s.setProcessedPosts);
  const dataSource = useDashboardStore((s) => s.dataSource);
  const rawPosts = useDashboardStore((s) => s.rawPosts);

  return useMutation({
    mutationFn: (filters: PostFilters) => {
      if (dataSource === "linkedin") {
        return processPostsRequest(filters, { source: "linkedin" });
      }

      return processPostsRequest(filters, {
        posts: rawPosts,
        source: dataSource ?? "upload",
      });
    },
    onSuccess: (data) => {
      setProcessedPosts(data.posts);
    },
  });
}
