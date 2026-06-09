"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Loader2, Lock, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Login failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/") ? from : "/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Briefcase className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Job Finder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your hiring dashboard
          </p>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-id">ID</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-id"
                  autoComplete="username"
                  placeholder="admin"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is restricted to authorized users only.
        </p>
      </div>
    </div>
  );
}
