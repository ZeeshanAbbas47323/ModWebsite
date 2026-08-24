import { useQuery } from "@tanstack/react-query";
import { pickupLocationService } from "@/services/pickup-location.service";

export function usePickupLocations(enabled = true) {
  return useQuery({
    queryKey: ["pickup-locations"],
    queryFn: pickupLocationService.list,
    enabled,
    staleTime: 10 * 60_000,
  });
}
