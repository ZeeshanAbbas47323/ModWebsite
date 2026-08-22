import { useQuery } from "@tanstack/react-query";
import { websiteSettingsService } from "@/services/website-settings.service";

export function useWebsiteSettings() {
  return useQuery({
    queryKey: ["website-settings"],
    queryFn: () => websiteSettingsService.get(),
    staleTime: 5 * 60_000,
  });
}
