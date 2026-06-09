"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProcessedPost } from "@/features/posts/types";
import { useDashboardStore } from "@/stores/dashboard-store";

interface PostsTableProps {
  posts: ProcessedPost[];
  isLoading?: boolean;
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function scoreVariant(score: number): "default" | "success" | "secondary" {
  if (score >= 70) return "success";
  if (score >= 40) return "default";
  return "secondary";
}

export function PostsTable({ posts, isLoading }: PostsTableProps) {
  const jobRole = useDashboardStore((s) => s.filters.jobRole);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-card text-muted-foreground">
        Processing posts…
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border bg-card text-muted-foreground">
        <p className="font-medium">No matching posts found</p>
        <p className="text-sm">
          Try adjusting filters, turn off &quot;Only show posts with email&quot;,
          or upload a JSON file with hiring posts.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="min-w-[200px]">Content</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.postId}>
              <TableCell className="font-medium">{post.author}</TableCell>
              <TableCell>{post.company}</TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(post.date)}
              </TableCell>
              <TableCell>
                {post.email ? (
                  <a
                    href={`mailto:${post.email}`}
                    className="text-primary hover:underline"
                  >
                    {post.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Apply on LinkedIn</span>
                )}
              </TableCell>
              <TableCell>
                <p className="line-clamp-3 max-w-xs text-sm text-muted-foreground">
                  {post.content}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant={scoreVariant(post.relevanceScore)}>
                  {post.relevanceScore}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {post.email ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/mail-to?${new URLSearchParams({
                          email: post.email,
                          company: post.company,
                          author: post.author,
                          role: post.roleName,
                          jobRole,
                        }).toString()}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Mail
                      </Link>
                    </Button>
                  ) : null}
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
