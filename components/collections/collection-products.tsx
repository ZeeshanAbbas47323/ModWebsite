"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

const PAGE_SIZE = 24;

/** Product grid for one collection, with its own pagination. */
export function CollectionProducts({ categoryId }: { categoryId: number }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useProducts({
    page,
    limit: PAGE_SIZE,
    filters: { category_id: categoryId },
  });

  const products = data?.payload ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 animate-pulse">
            <div className="w-full h-[280px] md:h-[350px] rounded-[24px] bg-[#F4F4F5]" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#F4F4F5] rounded-[24px] p-10 text-center">
        <p className="text-gray-600 mb-6">We could not load these products just now.</p>
        <Link href="/products"><Button size="xl">Browse all products</Button></Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[#F4F4F5] rounded-[24px] p-10 md:p-16 text-center">
        <h2 className="text-2xl font-bold text-black mb-3">Nothing here yet</h2>
        <p className="text-gray-600 mb-8">
          This collection has no products at the moment. Check back soon.
        </p>
        <Link href="/products"><Button size="xl">Browse all products</Button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} data={mapProductToCard(product)} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
