"use client";

import { Download, FileJson, FileSpreadsheet, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportToCsv,
  exportToExcel,
  exportToJson,
} from "@/features/export/export";
import type { ProcessedPost } from "@/features/posts/types";

interface ExportMenuProps {
  posts: ProcessedPost[];
  disabled?: boolean;
}

export function ExportMenu({ posts, disabled }: ExportMenuProps) {
  const hasPosts = posts.length > 0;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || !hasPosts}
        onClick={() => exportToCsv(posts)}
      >
        <Sheet className="h-4 w-4" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || !hasPosts}
        onClick={() => exportToExcel(posts)}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || !hasPosts}
        onClick={() => exportToJson(posts)}
      >
        <FileJson className="h-4 w-4" />
        JSON
      </Button>
      {!hasPosts && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Download className="h-3 w-3" />
          Export available when results exist
        </span>
      )}
    </div>
  );
}
