import { useQuery } from "@tanstack/react-query";
import { homeSectionService } from "@/services/home-section.service";

const queryKey = ["home-sections", "all"] as const;

// All calls share the same queryKey → single network request
export function useHomeSection(key: string) {
  return useQuery({
    queryKey,
    queryFn: () => homeSectionService.getAll(),
    select: (data) => data[key] ?? null,
    staleTime: 5 * 60_000,
  });
}
