import { useQuery } from "@tanstack/react-query";
import { addressService } from "@/services/address.service";

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: addressService.list,
    enabled,
    staleTime: 5 * 60_000,
  });
}
