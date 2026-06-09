import { Suspense } from "react";
import { MailComposePage } from "@/features/mail-to/components/mail-compose-page";

export default function MailToPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading mail composer…
        </div>
      }
    >
      <MailComposePage />
    </Suspense>
  );
}
