"use client";

import ProductCarousel from "@/components/product/product-carousel";
import { useProducts } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

interface CategoryCarouselProps {
  categoryId: number | number[];
  title?: string;
  description?: string;
  limit?: number;
  viewAllHref?: string;
}

const DEFAULT_DESCRIPTION =
  "From small business advertising to big event displays, Modfirst delivers bold.";

export function CategoryCarousel({
  categoryId,
  title,
  description,
  limit = 8,
  viewAllHref,
}: CategoryCarouselProps) {
  const { data, isLoading } = useProducts({
    limit,
    filters: { category_id: categoryId },
  });

  const products = data?.payload ?? [];

  if (isLoading) {
    return (
      <section className="container pt-10 md:pt-12 lg:pt-16">
        <div className="h-8 w-64 rounded-lg bg-[#F4F4F5] animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[350px] rounded-[24px] bg-[#F4F4F5] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const resolvedCategory = products.find((p) => p.category?.name)?.category;
  const resolvedTitle = title ?? resolvedCategory?.name ?? "Shop the collection";
  const resolvedViewAllHref =
    viewAllHref ?? (resolvedCategory?.slug ? `/categories/${resolvedCategory.slug}` : "/products");

  return (
    <ProductCarousel
      data={products.map(mapProductToCard)}
      title={resolvedTitle}
      description={description ?? DEFAULT_DESCRIPTION}
      viewAllHref={resolvedViewAllHref}
    />
  );
}
