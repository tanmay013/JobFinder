"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  FileText,
  Paperclip,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_HINTS } from "@/features/mail-to/constants";
import {
  buildFilledMail,
  buildGmailComposeUrl,
  buildMailtoUrl,
  bodyHtmlToDisplay,
  copyToClipboard,
  openComposeLink,
} from "@/features/mail-to/utils";
import { useQueryPlaceholders } from "@/features/mail-to/hooks/use-query-placeholders";
import { useMailStore } from "@/stores/mail-store";
import { ThemeToggle } from "@/components/theme-toggle";

export function MailComposePage() {
  const template = useMailStore((s) => s.template);
  const jobRole = useMailStore((s) => s.jobRole);
  const { activePlaceholders } = useQueryPlaceholders();
  const attachments = useMailStore((s) => s.attachments);
  const setTemplate = useMailStore((s) => s.setTemplate);
  const setPlaceholder = useMailStore((s) => s.setPlaceholder);
  const setCv = useMailStore((s) => s.setCv);
  const setCoverLetter = useMailStore((s) => s.setCoverLetter);
  const resetTemplate = useMailStore((s) => s.resetTemplate);

  const [copied, setCopied] = useState(false);
  const [mailtoNotice, setMailtoNotice] = useState<string | null>(null);

  const filled = useMemo(
    () => buildFilledMail(template, activePlaceholders),
    [template, activePlaceholders],
  );

  const canSend = Boolean(activePlaceholders.recipientEmail.trim());

  const mailtoLink = useMemo(() => {
    if (!canSend) return null;
    return buildMailtoUrl(
      activePlaceholders.recipientEmail,
      filled.subject,
      filled.body,
    );
  }, [canSend, activePlaceholders.recipientEmail, filled]);

  const gmailLink = useMemo(() => {
    if (!canSend) return null;
    return buildGmailComposeUrl(
      activePlaceholders.recipientEmail,
      filled.subject,
      filled.body,
    );
  }, [canSend, activePlaceholders.recipientEmail, filled]);

  const handleOpenGmail = () => {
    if (!gmailLink) return;
    setMailtoNotice(null);
    openComposeLink(gmailLink.url, "_blank");
  };

  const handleOpenMailApp = () => {
    if (!mailtoLink) return;

    if (!mailtoLink.bodyIncluded) {
      void copyToClipboard(filled.body);
      setMailtoNotice(
        "Email body copied to clipboard — paste it into your draft after the mail app opens.",
      );
    } else {
      setMailtoNotice(null);
    }

    openComposeLink(mailtoLink.url, "_self");
  };

  const handleCopy = async () => {
    const text = `Subject: ${filled.subject}\n\n${filled.body}`;
    const html = `<p><strong>Subject:</strong> ${filled.subject}</p><p>${bodyHtmlToDisplay(filled.bodyHtml)}</p>`;
    await copyToClipboard(text, html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Back to dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Mail To</h1>
              <p className="text-sm text-muted-foreground">
                {jobRole === "qa"
                  ? "QA / SDET template — Nilesh Pandey"
                  : "Frontend template — Tanmay Pandey"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={resetTemplate}>
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset template</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2 md:px-6">
        {/* Left: fields & template editor */}
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Recipient & details</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-email">Recipient email</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={activePlaceholders.recipientEmail}
                  onChange={(e) =>
                    setPlaceholder("recipientEmail", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-name">Role name</Label>
                <Input
                  id="role-name"
                  value={activePlaceholders.roleName}
                  onChange={(e) => setPlaceholder("roleName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hiring-manager">Hiring manager / team</Label>
                <Input
                  id="hiring-manager"
                  value={activePlaceholders.hiringManagerName}
                  onChange={(e) =>
                    setPlaceholder("hiringManagerName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company name</Label>
                <Input
                  id="company-name"
                  value={activePlaceholders.companyName}
                  onChange={(e) =>
                    setPlaceholder("companyName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="why-role">Why this role interests you</Label>
                <Textarea
                  id="why-role"
                  rows={2}
                  value={activePlaceholders.whyThisRoleInterestsYou}
                  onChange={(e) =>
                    setPlaceholder("whyThisRoleInterestsYou", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-reason">Company-specific reason</Label>
                <Textarea
                  id="company-reason"
                  rows={2}
                  value={activePlaceholders.companySpecificReason}
                  onChange={(e) =>
                    setPlaceholder("companySpecificReason", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={activePlaceholders.linkedinUrl}
                    onChange={(e) =>
                      setPlaceholder("linkedinUrl", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    value={activePlaceholders.portfolioUrl}
                    onChange={(e) =>
                      setPlaceholder("portfolioUrl", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Paperclip className="h-5 w-5" />
              Attachments
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Select your CV and cover letter. Browsers cannot attach files via
              mailto — attach them manually in your email client after opening.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AttachmentPicker
                id="cv-upload"
                label="CV / Resume"
                file={attachments.cv}
                accept=".pdf,.doc,.docx"
                onChange={setCv}
              />
              <AttachmentPicker
                id="cover-letter-upload"
                label="Cover letter"
                file={attachments.coverLetter}
                accept=".pdf,.doc,.docx"
                onChange={setCoverLetter}
              />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Edit template</h2>
            <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <span>Placeholders:</span>
              {PLACEHOLDER_HINTS.map((h) => (
                <Badge key={h.key} variant="outline">
                  {h.key}
                </Badge>
              ))}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-template">Subject template</Label>
                <Input
                  id="subject-template"
                  value={template.subject}
                  onChange={(e) => setTemplate({ subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body-template">Body template</Label>
                <Textarea
                  id="body-template"
                  rows={16}
                  className="font-mono text-sm"
                  value={template.body}
                  onChange={(e) => setTemplate({ body: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: preview & actions */}
        <div className="space-y-6">
          <section className="sticky top-6 rounded-xl border bg-card p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Preview
            </h2>

            <div className="mb-4 space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Subject
              </p>
              <p className="text-sm font-semibold">{filled.subject}</p>
            </div>

            <div className="mb-4 max-h-[420px] overflow-y-auto rounded-lg border bg-background p-4">
              <div
                className="font-sans text-sm leading-relaxed [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: bodyHtmlToDisplay(filled.bodyHtml),
                }}
              />
            </div>

            {(attachments.cv || attachments.coverLetter) && (
              <div className="mb-4 rounded-lg border border-dashed p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Remember to attach
                </p>
                <ul className="space-y-1 text-sm">
                  {attachments.cv && (
                    <li className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5" />
                      {attachments.cv.name}
                    </li>
                  )}
                  {attachments.coverLetter && (
                    <li className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5" />
                      {attachments.coverLetter.name}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                type="button"
                disabled={!gmailLink}
                onClick={handleOpenGmail}
              >
                <Send className="h-4 w-4" />
                Open in Gmail
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  variant="outline"
                  type="button"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy email"}
                </Button>
              </div>
            </div>

            {!canSend && (
              <p className="mt-3 text-sm text-amber-600">
                Add a recipient email to enable sending options.
              </p>
            )}
            {canSend && (
              <p className="mt-3 text-xs text-muted-foreground">
                Use Gmail if the mail app button does nothing — many browsers
                need Gmail or a configured default mail app for mailto links.
              </p>
            )}
            {mailtoNotice && (
              <p className="mt-3 text-sm text-blue-600">{mailtoNotice}</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function AttachmentPicker({
  id,
  label,
  file,
  accept,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  accept: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="file"
          accept={accept}
          className="cursor-pointer"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {file ? (
        <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-sm">
          <span className="truncate">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">PDF or Word document</p>
      )}
    </div>
  );
}
