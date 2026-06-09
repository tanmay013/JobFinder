import type { JobRole } from "@/features/posts/types";
import type { MailPlaceholders, MailTemplate } from "./types";

export const DEFAULT_SUBJECT =
  "Application for {{ROLE_NAME}} Position";

export const FRONTEND_BODY = `Dear {{HIRING_MANAGER_NAME}},

I'm writing to express my interest in the {{ROLE_NAME}} position at {{COMPANY_NAME}}. With experience building scalable applications using React.js, Next.js, TypeScript, and Ionic, I am particularly interested in this opportunity because {{WHY_THIS_ROLE_INTERESTS_YOU}}.

At Lenskart, I have contributed to products serving 2,200+ stores globally, improving performance, reliability, and user experience across web and hybrid platforms. I enjoy solving complex frontend problems and building products that create measurable impact.

I look forward to bringing my experience to {{COMPANY_NAME}}.

Best regards,
Tanmay Pandey
+917827183757
{{LINKEDIN_URL}}
{{PORTFOLIO_URL}}`;

export const QA_BODY = `Dear {{HIRING_MANAGER_NAME}},

I am applying for the {{ROLE_NAME}} position at {{COMPANY_NAME}}. With experience in QA automation, SDET practices, and building reliable test frameworks, I am particularly interested in this opportunity because {{WHY_THIS_ROLE_INTERESTS_YOU}}.

I have hands-on experience with test automation, API testing, and ensuring product quality across web and mobile platforms. I enjoy improving release confidence through strong QA processes and well-designed test coverage.

I look forward to bringing my experience to {{COMPANY_NAME}}.

Best regards,
Nilesh Pandey
{{LINKEDIN_URL}}
{{PORTFOLIO_URL}}`;

export const FRONTEND_TEMPLATE: MailTemplate = {
  subject: DEFAULT_SUBJECT,
  body: FRONTEND_BODY,
};

export const QA_TEMPLATE: MailTemplate = {
  subject: DEFAULT_SUBJECT,
  body: QA_BODY,
};

/** @deprecated Use FRONTEND_TEMPLATE */
export const DEFAULT_TEMPLATE = FRONTEND_TEMPLATE;

export const FRONTEND_PLACEHOLDERS: MailPlaceholders = {
  roleName: "Frontend Engineer",
  hiringManagerName: "Hiring Team",
  companyName: "",
  whyThisRoleInterestsYou:
    "it aligns with my expertise in React, Next.js, and building high-performance user experiences",
  companySpecificReason:
    "your focus on innovative products and engineering excellence",
  linkedinUrl: "https://www.linkedin.com/in/tanmay-pandey-developer-india/",
  portfolioUrl: "https://tanmaypandey.com/",
  recipientEmail: "",
};

export const QA_PLACEHOLDERS: MailPlaceholders = {
  roleName: "QA / SDET Engineer",
  hiringManagerName: "Hiring Team",
  companyName: "",
  whyThisRoleInterestsYou:
    "it aligns with my expertise in test automation, SDET practices, and quality engineering",
  companySpecificReason:
    "your focus on quality, reliability, and engineering excellence",
  linkedinUrl: "",
  portfolioUrl: "",
  recipientEmail: "",
};

/** @deprecated Use FRONTEND_PLACEHOLDERS */
export const DEFAULT_PLACEHOLDERS = FRONTEND_PLACEHOLDERS;

export function getMailDefaultsForJobRole(jobRole: JobRole): {
  template: MailTemplate;
  placeholders: MailPlaceholders;
} {
  if (jobRole === "qa") {
    return {
      template: QA_TEMPLATE,
      placeholders: QA_PLACEHOLDERS,
    };
  }

  return {
    template: FRONTEND_TEMPLATE,
    placeholders: FRONTEND_PLACEHOLDERS,
  };
}

export const PLACEHOLDER_HINTS = [
  { key: "{{ROLE_NAME}}", label: "Role name" },
  { key: "{{HIRING_MANAGER_NAME}}", label: "Hiring manager / team" },
  { key: "{{COMPANY_NAME}}", label: "Company name" },
  {
    key: "{{WHY_THIS_ROLE_INTERESTS_YOU}}",
    label: "Why this role interests you",
  },
  { key: "{{COMPANY_SPECIFIC_REASON}}", label: "Company-specific reason" },
  { key: "{{LINKEDIN_URL}}", label: "LinkedIn hyperlink" },
  { key: "{{PORTFOLIO_URL}}", label: "Portfolio hyperlink" },
] as const;
