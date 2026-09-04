import { useQuery } from "@tanstack/react-query";
import { SHARED_CONTENT_STALE_TIME } from "@/lib/query-client";
import { popupService } from "@/services/popup.service";

export function usePopups() {
  return useQuery({
    queryKey: ["popups"],
    queryFn: () => popupService.getActive(),
    staleTime: SHARED_CONTENT_STALE_TIME,
    gcTime: SHARED_CONTENT_STALE_TIME,
  });
}
