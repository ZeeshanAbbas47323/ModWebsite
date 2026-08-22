import { useQuery } from "@tanstack/react-query";
import { footerSectionService } from "@/services/footer-section.service";

export const footerSectionKeys = {
  all: ["footer-sections"] as const,
};

export function useFooterSections() {
  return useQuery({
    queryKey: footerSectionKeys.all,
    queryFn: () => footerSectionService.list(),
    staleTime: 60_000,
  });
}
