import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menu.service";

export function useMenuTree() {
  return useQuery({
    queryKey: ["menus", "tree"],
    queryFn: () => menuService.getTree(),
    staleTime: 5 * 60_000,
  });
}
