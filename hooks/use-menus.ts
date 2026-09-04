import { useQuery } from "@tanstack/react-query";
import { SHARED_CONTENT_STALE_TIME } from "@/lib/query-client";
import { menuService } from "@/services/menu.service";

export function useMenuTree() {
  return useQuery({
    queryKey: ["menus", "tree"],
    queryFn: () => menuService.getTree(),
    staleTime: SHARED_CONTENT_STALE_TIME,
    gcTime: SHARED_CONTENT_STALE_TIME,
  });
}
