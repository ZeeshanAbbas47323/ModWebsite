import { useQuery } from "@tanstack/react-query";
import { productCategoryService } from "@/services/product-category.service";

export function useProductCategories(parentId?: number | null) {
  return useQuery({
    queryKey: ["product-categories", parentId],
    queryFn: () => productCategoryService.list(parentId),
    staleTime: 60_000,
  });
}
