"use client";

import { NewsletterSection } from "../home/newsletter-section";
import ProductSection from "./product-section";
import { useProductCollection } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

/**
 * Ranked by real sales (`orderItems` count) via the same `frontend/collection`
 * endpoint the product-detail page's "related products" rail already uses —
 * no separate best-seller flag to maintain.
 */
export default function BestSellersWrapper() {
  const { data: products, isLoading } = useProductCollection("BEST_SELLERS", 24);
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
        <ProductSection
          data={productCards}
          title="Best Sellers"
          description="Our most-ordered products, ranked by real sales."
        />
      ) : (
        <section className="container pt-10 md:pt-16 pb-10 text-center">
          <h1 className="text-2xl font-bold text-black mb-3">Nothing here yet</h1>
          <p className="text-gray-600">Check back once a few orders are in.</p>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}
