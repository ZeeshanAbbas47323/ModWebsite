"use client";

import ProductCarousel from "@/components/product/product-carousel";
import { useProducts } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

interface CategoryCarouselProps {
  categoryId: number;
  title: string;
  description: string;
  limit?: number;
}

/**
 * One home-page row, filled from a single product category.
 *
 * Renders nothing when the category is empty — a heading over an empty rail
 * reads as a broken page, and the placeholder products it used to fall back on
 * belonged to a different category entirely.
 */
export function CategoryCarousel({
  categoryId,
  title,
  description,
  limit = 8,
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

  return (
    <ProductCarousel
      data={products.map(mapProductToCard)}
      title={title}
      description={description}
    />
  );
}
