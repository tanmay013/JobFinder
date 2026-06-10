import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FRONTEND_PLACEHOLDERS,
  FRONTEND_TEMPLATE,
  getMailDefaultsForJobRole,
} from "@/features/mail-to/constants";
import type {
  MailAttachments,
  MailPlaceholders,
  MailTemplate,
} from "@/features/mail-to/types";
import type { JobRole } from "@/features/posts/types";

interface MailState {
  jobRole: JobRole;
  template: MailTemplate;
  placeholders: MailPlaceholders;
  attachments: MailAttachments;
  setTemplate: (template: Partial<MailTemplate>) => void;
  setPlaceholder: <K extends keyof MailPlaceholders>(
    key: K,
    value: MailPlaceholders[K],
  ) => void;
  setPlaceholders: (placeholders: Partial<MailPlaceholders>) => void;
  applyMailDefaults: (
    jobRole: JobRole,
    overrides?: Partial<MailPlaceholders>,
  ) => void;
  setCv: (file: File | null) => void;
  setCoverLetter: (file: File | null) => void;
  resetTemplate: () => void;
  resetPlaceholders: () => void;
}

export const useMailStore = create<MailState>()(
  persist(
    (set) => ({
      jobRole: "frontend",
      template: FRONTEND_TEMPLATE,
      placeholders: FRONTEND_PLACEHOLDERS,
      attachments: { cv: null, coverLetter: null },
      setTemplate: (template) =>
        set((state) => ({
          template: { ...state.template, ...template },
        })),
      setPlaceholder: (key, value) =>
        set((state) => ({
          placeholders: { ...state.placeholders, [key]: value },
        })),
      setPlaceholders: (placeholders) =>
        set((state) => ({
          placeholders: { ...state.placeholders, ...placeholders },
        })),
      applyMailDefaults: (jobRole, overrides = {}) => {
        const defaults = getMailDefaultsForJobRole(jobRole);
        set({
          jobRole,
          template: defaults.template,
          placeholders: { ...defaults.placeholders, ...overrides },
        });
      },
      setCv: (file) =>
        set((state) => ({
          attachments: { ...state.attachments, cv: file },
        })),
      setCoverLetter: (file) =>
        set((state) => ({
          attachments: { ...state.attachments, coverLetter: file },
        })),
      resetTemplate: () =>
        set((state) => ({
          template: getMailDefaultsForJobRole(state.jobRole).template,
        })),
      resetPlaceholders: () =>
        set((state) => ({
          placeholders: getMailDefaultsForJobRole(state.jobRole).placeholders,
        })),
    }),
    {
      name: "job-finder-mail",
      version: 5,
      migrate: (persisted, version) => {
        const state = persisted as {
          jobRole?: JobRole;
          template?: MailTemplate;
          placeholders?: MailPlaceholders;
        };

        if (version < 2 && state.template?.body) {
          if (
            !state.template.body.includes("{{LINKEDIN_URL}}") &&
            !state.template.body.includes("{{PORTFOLIO_URL}}")
          ) {
            state.template.body = `${state.template.body.trim()}\n{{LINKEDIN_URL}} | {{PORTFOLIO_URL}}`;
          }
        }

        if (state.placeholders) {
          if (!state.placeholders.portfolioUrl) {
            state.placeholders.portfolioUrl =
              FRONTEND_PLACEHOLDERS.portfolioUrl;
          }
          if (!state.placeholders.linkedinUrl) {
            state.placeholders.linkedinUrl = FRONTEND_PLACEHOLDERS.linkedinUrl;
          }
        }

        if (version < 3) {
          state.jobRole = "frontend";
        }

        if (version < 4) {
          const jobRole = state.jobRole ?? "frontend";
          const defaults = getMailDefaultsForJobRole(jobRole);
          if (state.placeholders && !state.placeholders.applicantName) {
            state.placeholders.applicantName = defaults.placeholders.applicantName;
          }
          if (
            state.template?.subject &&
            !state.template.subject.includes("{{APPLICANT_NAME}}")
          ) {
            state.template.subject = defaults.template.subject;
          }
        }

        if (version < 5 && state.template) {
          const jobRole = state.jobRole ?? "frontend";
          const defaults = getMailDefaultsForJobRole(jobRole);
          if (!state.template.coverLetterBody) {
            state.template.coverLetterBody = defaults.template.coverLetterBody;
          }
          state.template.body = defaults.template.body;
        }

        return persisted;
      },
      partialize: (state) => ({
        jobRole: state.jobRole,
        template: state.template,
        placeholders: state.placeholders,
      }),
    },
  ),
);
