"use client";

import { use } from "react";
import ProductDetailWrapper from "@/components/product-detail/product-detail-wrapper";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return <ProductDetailWrapper slug={slug} />;
}
