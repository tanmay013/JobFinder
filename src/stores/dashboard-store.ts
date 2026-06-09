import { create } from "zustand";
import { DEFAULT_PAGE_SIZE } from "@/features/posts/constants";
import type {
  DataSource,
  ExperienceRange,
  JobRole,
  LinkedInFetchMeta,
  PostFilters,
  ProcessedPost,
  RawPost,
} from "@/features/posts/types";

interface DashboardState {
  rawPosts: RawPost[];
  processedPosts: ProcessedPost[];
  filters: PostFilters;
  page: number;
  pageSize: number;
  dataSource: DataSource | null;
  linkedInMeta: LinkedInFetchMeta | null;
  fetchError: string | null;
  uploadError: string | null;
  setRawPosts: (posts: RawPost[], source: DataSource) => void;
  setLinkedInMeta: (meta: LinkedInFetchMeta | null) => void;
  setFetchError: (error: string | null) => void;
  setProcessedPosts: (posts: ProcessedPost[]) => void;
  setJobRole: (role: JobRole) => void;
  setRoleKeyword: (keyword: string) => void;
  setExperienceRange: (range: ExperienceRange) => void;
  setPostedDateFrom: (date: string | null) => void;
  setPostedDateTo: (date: string | null) => void;
  setRequireEmail: (require: boolean) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setUploadError: (error: string | null) => void;
  resetFilters: () => void;
}

const defaultFilters: PostFilters = {
  jobRole: "frontend",
  roleKeyword: "",
  experienceRange: "2.5+",
  postedDateFrom: null,
  postedDateTo: null,
  requireEmail: false,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  rawPosts: [],
  processedPosts: [],
  filters: defaultFilters,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  dataSource: null,
  linkedInMeta: null,
  fetchError: null,
  uploadError: null,
  setRawPosts: (posts, source) =>
    set({
      rawPosts: posts,
      dataSource: source,
      page: 1,
      uploadError: null,
      fetchError: null,
    }),
  setLinkedInMeta: (meta) => set({ linkedInMeta: meta }),
  setFetchError: (error) => set({ fetchError: error }),
  setProcessedPosts: (posts) => set({ processedPosts: posts, page: 1 }),
  setJobRole: (jobRole) =>
    set((state) => ({
      filters: { ...state.filters, jobRole },
      page: 1,
    })),
  setRoleKeyword: (keyword) =>
    set((state) => ({
      filters: { ...state.filters, roleKeyword: keyword },
      page: 1,
    })),
  setExperienceRange: (range) =>
    set((state) => ({
      filters: { ...state.filters, experienceRange: range },
      page: 1,
    })),
  setPostedDateFrom: (date) =>
    set((state) => ({
      filters: { ...state.filters, postedDateFrom: date },
      page: 1,
    })),
  setPostedDateTo: (date) =>
    set((state) => ({
      filters: { ...state.filters, postedDateTo: date },
      page: 1,
    })),
  setRequireEmail: (requireEmail) =>
    set((state) => ({
      filters: { ...state.filters, requireEmail },
      page: 1,
    })),
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
  setUploadError: (error) => set({ uploadError: error }),
  resetFilters: () =>
    set((state) => ({
      filters: { ...defaultFilters, jobRole: state.filters.jobRole },
      page: 1,
    })),
}));
