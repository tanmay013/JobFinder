"use client";

import { useRef } from "react";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseUploadedJson } from "@/lib/api";
import { useDashboardStore } from "@/stores/dashboard-store";

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setRawPosts = useDashboardStore((s) => s.setRawPosts);
  const setUploadError = useDashboardStore((s) => s.setUploadError);
  const uploadError = useDashboardStore((s) => s.uploadError);
  const dataSource = useDashboardStore((s) => s.dataSource);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const posts = parseUploadedJson(text);
      setRawPosts(posts, "upload");
      setUploadError(null);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to parse JSON file",
      );
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Upload JSON
      </Button>

      {dataSource && (
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <FileUp className="h-3.5 w-3.5" />
          Source: {dataSource}
        </span>
      )}

      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}
    </div>
  );
}
