"use client";

import ProductCarousel from "@/components/product/product-carousel";
import { useProductCollection } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

interface CollectionCarouselProps {
  type: "BEST_SELLERS" | "MOST_POPULAR" | "NEWEST" | "FEATURED";
  title: string;
  description?: string;
  count?: number;
  viewAllHref?: string;
}

const DEFAULT_DESCRIPTION =
  "From small business advertising to big event displays, Modfirst delivers bold.";

/** One home-page row backed by `products/frontend/collection`. */
export function CollectionCarousel({
  type,
  title,
  description,
  count = 8,
  viewAllHref = "/products",
}: CollectionCarouselProps) {
  const { data: products, isLoading } = useProductCollection(type, count);

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

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      data={products.map(mapProductToCard)}
      title={title}
      description={description ?? DEFAULT_DESCRIPTION}
      viewAllHref={viewAllHref}
    />
  );
}
