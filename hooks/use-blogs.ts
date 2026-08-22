import { useQuery } from "@tanstack/react-query";
import { blogService, type BlogListParams } from "@/services/blog.service";

export const blogKeys = {
  all: ["blogs"] as const,
  list: (params: BlogListParams) => [...blogKeys.all, "list", params] as const,
  detail: (slug: string) => [...blogKeys.all, "detail", slug] as const,
};

export function useBlogs(params: BlogListParams) {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => blogService.list(params),
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => blogService.detail(slug),
    enabled: !!slug,
  });
}
