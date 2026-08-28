import { useQuery } from "@tanstack/react-query";
import type { BuilderProduct } from "@/lib/gang-sheet";

async function fetchBuilderProducts(): Promise<BuilderProduct[]> {
  const res = await fetch("/api/gang-sheet/products");
  if (!res.ok) return [];
  const data = await res.json();
  return data.products ?? [];
}

/**
 * The builder's catalogue, used to decide whether a storefront product opens
 * the builder — they are matched on slug.
 */
export function useGangSheetProducts() {
  return useQuery({
    queryKey: ["gang-sheet-products"],
    queryFn: fetchBuilderProducts,
    staleTime: 10 * 60_000,
  });
}
