/** Raw post from JSON upload or API. */
export interface RawPost {
  postId: string;
  author: string;
  content: string;
  date: string;
  company: string;
  postUrl: string;
}

/** Processed hiring post with extracted metadata. */
export interface ProcessedPost {
  postId: string;
  author: string;
  content: string;
  date: string;
  company: string;
  postUrl: string;
  email: string;
  emails: string[];
  roleName: string;
  relevanceScore: number;
  matchedKeywords: string[];
  experienceSignals: string[];
}

export type JobRole = "frontend" | "qa";

export interface PostFilters {
  jobRole: JobRole;
  roleKeyword: string;
  experienceRange: ExperienceRange;
  postedDateFrom: string | null;
  postedDateTo: string | null;
  requireEmail: boolean;
}

export type ExperienceRange =
  | "all"
  | "2.5+"
  | "2-4"
  | "3+"
  | "3-5"
  | "mid-level";

export type DataSource = "linkedin" | "api" | "upload";

export interface LinkedInFetchMeta {
  cached: boolean;
  lastFetchedAt: string | null;
  nextFetchAt: string | null;
  fetchIntervalHours: number;
  maxPostsPerFetch: number;
  totalStored: number;
}

export interface PostsApiResponse {
  posts: RawPost[];
  source: DataSource;
  total: number;
  meta?: LinkedInFetchMeta;
  error?: string;
}

export interface ProcessedPostsResponse {
  posts: ProcessedPost[];
  stats: DashboardStats;
  source: DataSource;
}

export interface DashboardStats {
  totalPosts: number;
  postsWithEmail: number;
  uniqueCompanies: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
