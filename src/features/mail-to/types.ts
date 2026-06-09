export interface MailPlaceholders {
  roleName: string;
  hiringManagerName: string;
  companyName: string;
  whyThisRoleInterestsYou: string;
  companySpecificReason: string;
  linkedinUrl: string;
  portfolioUrl: string;
  recipientEmail: string;
}

export interface MailAttachments {
  cv: File | null;
  coverLetter: File | null;
}

export interface MailTemplate {
  subject: string;
  body: string;
}
