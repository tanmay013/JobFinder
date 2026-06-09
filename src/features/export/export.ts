import * as XLSX from "xlsx";
import type { ProcessedPost } from "@/features/posts/types";

function toExportRow(post: ProcessedPost) {
  return {
    Author: post.author,
    Company: post.company,
    "Post Date": post.date,
    Email: post.email,
    Role: post.roleName,
    "Relevance Score": post.relevanceScore,
    "Matched Keywords": post.matchedKeywords.join(", "),
    "Experience Signals": post.experienceSignals.join(", "),
    Content: post.content,
    "Post URL": post.postUrl,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportToJson(posts: ProcessedPost[], filename = "hiring-posts.json") {
  const payload = posts.map((post) => ({
    postId: post.postId,
    author: post.author,
    company: post.company,
    date: post.date,
    email: post.email,
    emails: post.emails,
    roleName: post.roleName,
    relevanceScore: post.relevanceScore,
    matchedKeywords: post.matchedKeywords,
    experienceSignals: post.experienceSignals,
    content: post.content,
    postUrl: post.postUrl,
  }));

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

export function exportToCsv(posts: ProcessedPost[], filename = "hiring-posts.csv") {
  const rows = posts.map(toExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export function exportToExcel(
  posts: ProcessedPost[],
  filename = "hiring-posts.xlsx",
) {
  const rows = posts.map(toExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hiring Posts");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, filename);
}
