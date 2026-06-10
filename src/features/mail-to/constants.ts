import type { JobRole } from "@/features/posts/types";
import type { MailPlaceholders, MailTemplate } from "./types";

export const DEFAULT_SUBJECT =
  "Resume || {{ROLE_NAME}} || {{APPLICANT_NAME}}";

export const FRONTEND_BODY = `Dear {{HIRING_MANAGER_NAME}},

I hope you're doing well. My name is Tanmay Pandey, and I am currently working as a Software Development Engineer II at Lenskart, where I build and maintain large-scale web and hybrid applications used across 2,200+ stores globally.

Over the past few years, I have developed expertise in React.js, Next.js, TypeScript, JavaScript, Ionic, and modern frontend architecture, with a strong focus on building scalable, performant, and user-centric applications.

My experience includes working on e-commerce platforms, POS systems, internal business tools, location-based services, OCR integrations, and hybrid mobile applications. I have been involved in designing reusable architectures, optimizing application performance, integrating complex APIs, and delivering features that serve users at scale.

I am excited about the opportunity to contribute to {{COMPANY_NAME}} as a {{ROLE_NAME}} and believe my experience aligns well with the requirements of the role.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
Tanmay Pandey
+91 7827183757
{{LINKEDIN_URL}}
{{PORTFOLIO_URL}}`;

export const QA_BODY = `Dear {{HIRING_MANAGER_NAME}},

I hope you're doing well. I am Nilesh Pandey, and I am currently working as SDET-2 at Lenskart, where I focus on API and automation testing, mobile testing, and CI/CD-driven releases in an Agile environment.

Over the past few years, I have developed expertise in test automation and quality assurance, with hands-on experience in Selenium (Java), API automation using Rest Assured, Appium, and manual testing.

My experience includes building reliable test frameworks, designing end-to-end automation suites, API and mobile testing, and improving release confidence through strong QA processes and well-designed test coverage across web and hybrid applications.

I am excited about the opportunity to contribute to {{COMPANY_NAME}} as a {{ROLE_NAME}} and believe my experience aligns well with the requirements of the role.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
Nilesh Pandey
+91 9971679951
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
  applicantName: "Tanmay Pandey",
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
  roleName: "SDET / QA Engineer",
  applicantName: "Nilesh Pandey",
  hiringManagerName: "Hiring Team",
  companyName: "",
  whyThisRoleInterestsYou:
    "it aligns with my expertise in test automation, SDET practices, and quality engineering",
  companySpecificReason:
    "your focus on quality, reliability, and engineering excellence",
  linkedinUrl: "https://www.linkedin.com/in/nileshpandey036a3824",
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
  { key: "{{APPLICANT_NAME}}", label: "Your name" },
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
