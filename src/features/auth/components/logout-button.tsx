"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — we still redirect to the login screen
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      title="Log out"
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Log out</span>
    </Button>
  );
}
