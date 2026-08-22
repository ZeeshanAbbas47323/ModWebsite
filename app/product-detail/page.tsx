"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ProductDetail from "@/components/product-detail/product-detail";
import { NewsletterSection } from "@/components/home/newsletter-section";

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id")) || 0;
  return (
    <>
      <ProductDetail productId={id || undefined} />
      <NewsletterSection />
    </>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense>
      <ProductDetailContent />
    </Suspense>
  );
}
