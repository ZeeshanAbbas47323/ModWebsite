import { useQuery } from "@tanstack/react-query";
import { SHARED_CONTENT_STALE_TIME } from "@/lib/query-client";
import { productCategoryService } from "@/services/product-category.service";

export function useProductCategories(parentId?: number | null) {
  return useQuery({
    queryKey: ["product-categories", parentId],
    queryFn: () => productCategoryService.list(parentId),
    staleTime: SHARED_CONTENT_STALE_TIME,
    gcTime: SHARED_CONTENT_STALE_TIME,
  });
}
