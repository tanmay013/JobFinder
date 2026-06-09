"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExperienceRange, JobRole } from "@/features/posts/types";
import { useDashboardStore } from "@/stores/dashboard-store";

const jobRoleOptions: { value: JobRole; label: string }[] = [
  { value: "frontend", label: "Frontend Engineer" },
  { value: "qa", label: "QA / SDET Engineer" },
];

const experienceOptions: { value: ExperienceRange; label: string }[] = [
  { value: "all", label: "All experience levels" },
  { value: "2.5+", label: "2.5+ years" },
  { value: "2-4", label: "2-4 years" },
  { value: "3+", label: "3+ years" },
  { value: "3-5", label: "3-5 years" },
  { value: "mid-level", label: "Mid-level frontend" },
];

export function FiltersPanel() {
  const filters = useDashboardStore((s) => s.filters);
  const setJobRole = useDashboardStore((s) => s.setJobRole);
  const setExperienceRange = useDashboardStore((s) => s.setExperienceRange);
  const setPostedDateFrom = useDashboardStore((s) => s.setPostedDateFrom);
  const setPostedDateTo = useDashboardStore((s) => s.setPostedDateTo);
  const setRequireEmail = useDashboardStore((s) => s.setRequireEmail);
  const resetFilters = useDashboardStore((s) => s.resetFilters);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Job role</Label>
          <Select
            value={filters.jobRole}
            onValueChange={(value) => setJobRole(value as JobRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {jobRoleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Experience range</Label>
          <Select
            value={filters.experienceRange}
            onValueChange={(value) =>
              setExperienceRange(value as ExperienceRange)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              {experienceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">Posted from</Label>
          <Input
            id="date-from"
            type="date"
            value={filters.postedDateFrom ?? ""}
            onChange={(e) =>
              setPostedDateFrom(e.target.value || null)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">Posted to</Label>
          <Input
            id="date-to"
            type="date"
            value={filters.postedDateTo ?? ""}
            onChange={(e) => setPostedDateTo(e.target.value || null)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.requireEmail}
            onChange={(e) => setRequireEmail(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Only show posts with email addresses
        </label>

        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
