"use client";

import { Loader2 } from "lucide-react";

interface DashboardLoaderProps {
  message: string;
}

export function DashboardLoader({ message }: DashboardLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 shadow-sm"
    >
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}
