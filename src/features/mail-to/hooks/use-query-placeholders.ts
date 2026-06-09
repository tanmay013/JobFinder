"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { MailPlaceholders } from "@/features/mail-to/types";
import { normalizeRecipientEmail } from "@/features/mail-to/utils";
import type { JobRole } from "@/features/posts/types";
import { useMailStore } from "@/stores/mail-store";

function parseJobRole(value: string | null): JobRole {
  return value === "qa" ? "qa" : "frontend";
}

function readQueryPlaceholders(
  searchParams: URLSearchParams,
): Partial<MailPlaceholders> {
  const email = searchParams.get("email");
  const company = searchParams.get("company");
  const author = searchParams.get("author");
  const role = searchParams.get("role");

  return {
    ...(email ? { recipientEmail: normalizeRecipientEmail(email) } : {}),
    ...(company ? { companyName: company } : {}),
    ...(author ? { hiringManagerName: author } : {}),
    ...(role ? { roleName: role } : {}),
  };
}

export function useQueryPlaceholders() {
  const searchParams = useSearchParams();
  const placeholders = useMailStore((s) => s.placeholders);
  const applyMailDefaults = useMailStore((s) => s.applyMailDefaults);
  const setPlaceholders = useMailStore((s) => s.setPlaceholders);

  const jobRole = useMemo(
    () => parseJobRole(searchParams.get("jobRole")),
    [searchParams],
  );

  const queryOverrides = useMemo(
    () => readQueryPlaceholders(searchParams),
    [searchParams],
  );

  const hasQueryOverrides = Object.keys(queryOverrides).length > 0;
  const hasJobRoleParam = searchParams.has("jobRole");

  useEffect(() => {
    if (!hasJobRoleParam && !hasQueryOverrides) return;

    const applyFromQuery = () => {
      if (hasJobRoleParam) {
        applyMailDefaults(jobRole, queryOverrides);
        return;
      }

      setPlaceholders(queryOverrides);
    };

    if (useMailStore.persist.hasHydrated()) {
      applyFromQuery();
      return;
    }

    return useMailStore.persist.onFinishHydration(applyFromQuery);
  }, [
    applyMailDefaults,
    hasJobRoleParam,
    hasQueryOverrides,
    jobRole,
    queryOverrides,
    setPlaceholders,
  ]);

  const activePlaceholders = useMemo(
    () => ({ ...placeholders, ...queryOverrides }),
    [placeholders, queryOverrides],
  );

  return { activePlaceholders, queryOverrides, jobRole };
}
