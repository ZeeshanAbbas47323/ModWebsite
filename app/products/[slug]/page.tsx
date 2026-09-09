import type { Metadata } from "next";

import ProductDetailWrapper from "@/components/product-detail/product-detail-wrapper";
import { resolveImageUrl } from "@/lib/image-url";
import { getProductBySlug } from "@/services/product.server";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return {};

    const title = product.meta_title?.trim() || product.name;
    const description =
        product.meta_desc?.trim() ||
        product.short_desc?.trim() ||
        (product.description ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200) ||
        undefined;

    const primary =
        product.images?.find((i) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
    const image = primary ? resolveImageUrl(primary) : null;

    return {
        title,
        ...(description ? { description } : {}),
        alternates: { canonical: `/products/${slug}` },
        openGraph: {
            type: "website",
            title,
            ...(description ? { description } : {}),
            url: `/products/${slug}`,
            ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
        },
        twitter: {
            card: image ? "summary_large_image" : "summary",
            title,
            ...(description ? { description } : {}),
            ...(image ? { images: [image] } : {}),
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    return <ProductDetailWrapper slug={slug} />;
}
