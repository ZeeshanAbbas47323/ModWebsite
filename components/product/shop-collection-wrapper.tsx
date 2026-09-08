"use client";

import { NewsletterSection } from "../home/newsletter-section";
import ProductSection from "./product-section";
import { useProductCollection } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

export type ShopCollectionType = "BEST_SELLERS" | "MOST_POPULAR" | "NEWEST" | "FEATURED";

interface ShopCollectionWrapperProps {
  type: ShopCollectionType;
  title: string;
  description: string;
  emptyTitle?: string;
  emptyDescription?: string;
  limit?: number;
}

/**
 * A full "view all" page for one of the `products/frontend/collection`
 * rankings — the same backend endpoint the home page's carousels and the
 * product-detail "related products" rail use, just with more items and its
 * own page/title instead of a home-page rail.
 */
export function ShopCollectionWrapper({
  type,
  title,
  description,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Check back again soon.",
  limit = 24,
}: ShopCollectionWrapperProps) {
  const { data: products, isLoading } = useProductCollection(type, limit);
  const productCards = (products ?? []).map(mapProductToCard);

  return (
    <>
      {isLoading ? (
        <section className="container pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F4F4F5] h-[350px] rounded-[24px] mb-6" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                <div className="h-5 bg-gray-100 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </section>
      ) : productCards.length > 0 ? (
        <ProductSection data={productCards} title={title} description={description} />
      ) : (
        <section className="container pt-10 md:pt-16 pb-10 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">{emptyTitle}</h1>
          <p className="text-gray-600">{emptyDescription}</p>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}
