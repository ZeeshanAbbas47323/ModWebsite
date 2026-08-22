import { useQuery, useMutation } from "@tanstack/react-query";
import { productService, type ProductListParams } from "@/services/product.service";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) => [...productKeys.all, "list", params] as const,
  collection: (type: string, count?: number, categoryId?: number) =>
    [...productKeys.all, "collection", type, count, categoryId] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
  bySlug: (slug: string) => [...productKeys.all, "slug", slug] as const,
  variants: (productId: number) => [...productKeys.all, "variants", productId] as const,
  images: (productId: number) => [...productKeys.all, "images", productId] as const,
  descriptions: (productId: number) => [...productKeys.all, "descriptions", productId] as const,
  faqs: (productId: number) => [...productKeys.all, "faqs", productId] as const,
};

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
  });
}

export function useProductCollection(type: string, count = 8, categoryId?: number) {
  return useQuery({
    queryKey: productKeys.collection(type, count, categoryId),
    queryFn: () => productService.collection(type, count, categoryId),
    staleTime: 60_000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductVariants(productId: number) {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => productService.getVariants(productId),
    enabled: !!productId,
  });
}

export function useProductImages(productId: number) {
  return useQuery({
    queryKey: productKeys.images(productId),
    queryFn: () => productService.getImages(productId),
    enabled: !!productId,
  });
}

export function useProductDescriptions(productId: number) {
  return useQuery({
    queryKey: productKeys.descriptions(productId),
    queryFn: () => productService.getDescriptions(productId),
    enabled: !!productId,
  });
}

export function useProductFaqs(productId: number) {
  return useQuery({
    queryKey: productKeys.faqs(productId),
    queryFn: () => productService.getFaqs(productId),
    enabled: !!productId,
  });
}

export function useIncreaseView() {
  return useMutation({
    mutationFn: (id: number) => productService.increaseView(id),
  });
}
