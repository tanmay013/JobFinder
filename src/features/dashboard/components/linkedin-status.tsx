"use client";

import { format, formatDistanceToNow } from "date-fns";
import { HardDrive, Linkedin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRefreshLinkedInPosts } from "@/features/posts/hooks/use-posts";
import { useDashboardStore } from "@/stores/dashboard-store";

export function LinkedInStatus() {
  const linkedInMeta = useDashboardStore((s) => s.linkedInMeta);
  const fetchError = useDashboardStore((s) => s.fetchError);
  const dataSource = useDashboardStore((s) => s.dataSource);
  const refreshMutation = useRefreshLinkedInPosts();

  if (dataSource && dataSource !== "linkedin") {
    return null;
  }

  const hasLocalData = (linkedInMeta?.totalStored ?? 0) > 0;
  const nextFetchAt = linkedInMeta?.nextFetchAt
    ? new Date(linkedInMeta.nextFetchAt)
    : null;
  const intervalElapsed =
    !nextFetchAt || nextFetchAt.getTime() <= Date.now();
  const canFetchFromApify = !hasLocalData || intervalElapsed;

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Linkedin className="h-3 w-3" />
          LinkedIn
        </Badge>

        {linkedInMeta && (
          <>
            <Badge variant="secondary" className="gap-1">
              <HardDrive className="h-3 w-3" />
              {linkedInMeta.totalStored} stored locally
            </Badge>
            <span className="text-sm text-muted-foreground">
              Refreshes every {linkedInMeta.fetchIntervalHours}h
            </span>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={!canFetchFromApify || refreshMutation.isPending}
          onClick={() => refreshMutation.mutate()}
          title={
            !hasLocalData
              ? "No local data — fetch from LinkedIn via Apify"
              : canFetchFromApify
                ? "Fetch latest from LinkedIn via Apify"
                : "Serving from local file until the next scheduled fetch"
          }
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
          />
          {canFetchFromApify ? "Fetch now" : "Cached"}
        </Button>
      </div>

      {linkedInMeta?.lastFetchedAt && (
        <p className="text-xs text-muted-foreground">
          Last Apify fetch:{" "}
          {format(new Date(linkedInMeta.lastFetchedAt), "MMM d, h:mm a")}
          {linkedInMeta.cached ? " · serving from local file" : ""}
        </p>
      )}

      {nextFetchAt && nextFetchAt.getTime() > Date.now() && (
        <p className="text-xs text-muted-foreground">
          Next Apify fetch{" "}
          {formatDistanceToNow(nextFetchAt, { addSuffix: true })}
        </p>
      )}

      {fetchError && (
        <p className="max-w-md text-right text-sm text-destructive">
          {fetchError}
        </p>
      )}
    </div>
  );
}
