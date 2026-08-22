import { useQuery } from "@tanstack/react-query";
import { popupService } from "@/services/popup.service";

export function usePopups() {
  return useQuery({
    queryKey: ["popups"],
    queryFn: () => popupService.getActive(),
    staleTime: 60_000,
  });
}
