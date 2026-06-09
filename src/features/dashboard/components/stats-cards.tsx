"use client";

import { Building2, Mail, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardStats } from "@/features/posts/types";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const cards = [
  {
    key: "totalPosts" as const,
    label: "Total Posts Found",
    description: "Hiring posts matching your filters",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "postsWithEmail" as const,
    label: "Posts with Email",
    description: "Posts containing contact emails",
    icon: Mail,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "uniqueCompanies" as const,
    label: "Unique Companies",
    description: "Distinct companies hiring",
    icon: Building2,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.key}
            className="border bg-card/60 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {isLoading ? "—" : stats[card.key]}
              </div>
              <CardDescription className="mt-1">{card.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
