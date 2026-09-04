import { useQuery } from "@tanstack/react-query";
import { SHARED_CONTENT_STALE_TIME } from "@/lib/query-client";
import { footerSectionService } from "@/services/footer-section.service";

export const footerSectionKeys = {
  all: ["footer-sections"] as const,
};

export function useFooterSections() {
  return useQuery({
    queryKey: footerSectionKeys.all,
    queryFn: () => footerSectionService.list(),
    staleTime: SHARED_CONTENT_STALE_TIME,
    gcTime: SHARED_CONTENT_STALE_TIME,
  });
}
