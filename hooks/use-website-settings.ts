import { useQuery } from "@tanstack/react-query";
import { SHARED_CONTENT_STALE_TIME } from "@/lib/query-client";
import { websiteSettingsService } from "@/services/website-settings.service";

export function useWebsiteSettings() {
  return useQuery({
    queryKey: ["website-settings"],
    queryFn: () => websiteSettingsService.get(),
    staleTime: SHARED_CONTENT_STALE_TIME,
    gcTime: SHARED_CONTENT_STALE_TIME,
  });
}
