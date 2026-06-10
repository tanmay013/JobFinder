"use client";

import { useEffect, useMemo } from "react";
import { Briefcase } from "lucide-react";
import { computeStats } from "@/features/posts/processing";
import { usePaginatedPosts } from "@/features/posts/hooks/use-paginated-posts";
import {
  useLinkedInPosts,
  useProcessPosts,
  useRefreshLinkedInPosts,
} from "@/features/posts/hooks/use-posts";
import { DashboardLoader } from "./dashboard-loader";
import { LinkedInStatus } from "./linkedin-status";
import { useDashboardStore } from "@/stores/dashboard-store";
import { ExportMenu } from "./export-menu";
import { FileUpload } from "./file-upload";
import { FiltersPanel } from "./filters-panel";
import { Pagination } from "./pagination";
import { PostsTable } from "./posts-table";
import { StatsCards } from "./stats-cards";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/features/auth/components/logout-button";

export function Dashboard() {
  const filters = useDashboardStore((s) => s.filters);
  const processedPosts = useDashboardStore((s) => s.processedPosts);
  const dataSource = useDashboardStore((s) => s.dataSource);

  const { isLoading: isLoadingLinkedIn } = useLinkedInPosts();
  const { mutate: processPosts, isPending: isProcessingPosts } =
    useProcessPosts();
  const { isPending: isRefreshingLinkedIn } = useRefreshLinkedInPosts();
  const pagination = usePaginatedPosts();

  // Re-process when filters change (server reads cache for LinkedIn)
  useEffect(() => {
    if (dataSource === null) return;

    const timer = setTimeout(() => {
      processPosts(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, dataSource, processPosts]);

  const stats = useMemo(
    () => computeStats(processedPosts),
    [processedPosts],
  );

  const isFetchingLinkedIn = isLoadingLinkedIn || isRefreshingLinkedIn;
  const isProcessing = isProcessingPosts || isFetchingLinkedIn;

  const loaderMessage =
    isFetchingLinkedIn && isProcessingPosts
      ? "Fetching and processing posts…"
      : isFetchingLinkedIn
        ? "Fetching posts from LinkedIn…"
        : "Processing and scoring posts…";

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Senior Frontend Job Finder
              </h1>
              <p className="text-sm text-muted-foreground">
                LinkedIn hiring posts (not jobs) — cached locally, refresh every 6h
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <LinkedInStatus isLoading={isProcessing} />
              <ThemeToggle />
              <LogoutButton />
            </div>
            <FileUpload />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
        {isProcessing && <DashboardLoader message={loaderMessage} />}

        <StatsCards stats={stats} isLoading={isProcessing} />
        <FiltersPanel />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Results</h2>
          <ExportMenu posts={processedPosts} disabled={isProcessing} />
        </div>

        <PostsTable posts={pagination.items} isLoading={isProcessing} />
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
        />
      </main>
    </div>
  );
}
