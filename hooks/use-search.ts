import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";

export function useSearch(query: string, types?: string[], limit = 5) {
  return useQuery({
    queryKey: ["search", query, types, limit],
    queryFn: () => searchService.search(query, types, limit),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
