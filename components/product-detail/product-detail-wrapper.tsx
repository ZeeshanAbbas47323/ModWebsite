"use client";

import Link from "next/link";
import { NewsletterSection } from "../home/newsletter-section";
import ProductCarousel from "../product/product-carousel";
import ProductDetail from "./product-detail";
import { Button } from "../ui/button";
import { useProductBySlug, useProductCollection } from "@/hooks/use-products";
import { mapProductToCard } from "@/lib/map-product-to-card";

const fallbackRelated = [
    { title: "DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/booklet.png" },
    { title: "Reflective DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/book.png" },
    { title: "UV DTF", count: "50 Products", img_path: "/images/banners-compositions/shirt.png" },
    { title: "Sublimation", count: "50 Products", img_path: "/images/banners-compositions/launch-box.png" },
    { title: "Custom Patches", count: "50 Products", img_path: "/images/banners-compositions/stamp.svg" },
];

interface ProductDetailWrapperProps {
    slug: string;
}

const ProductDetailWrapper = ({ slug }: ProductDetailWrapperProps) => {
    const { data: product, isLoading } = useProductBySlug(slug);
    const { data: related } = useProductCollection("BEST_SELLERS", 8, product?.category_id ?? undefined);

    const relatedCards = related?.filter((p) => p.id !== product?.id).map(mapProductToCard) ?? fallbackRelated;

    if (isLoading) {
        return (
            <section className="container pt-10 md:pt-12 lg:pt-16">
                <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-7 h-[500px] bg-gray-100 rounded-3xl" />
                    <div className="lg:col-span-5 space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-100 rounded w-1/4" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                </div>
            </section>
        );
    }






    if (!product) {
        return (
            <>
                <section className="container pt-10 md:pt-16 pb-10 md:pb-16 text-center">
                    <p className="text-sm font-semibold tracking-wide text-[#8a8a8a] uppercase">
                        Not available
                    </p>
                    <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-black">
                        This product isn&apos;t available right now
                    </h1>
                    <p className="mt-4 max-w-md mx-auto text-base text-gray-600">
                        It may have been removed or is temporarily unpublished. Take a look at
                        what&apos;s popular instead.
                    </p>
                    <div className="mt-8">
                        <Button size="xl" asChild>
                            <Link href="/products">Browse all products</Link>
                        </Button>
                    </div>
                </section>
                <ProductCarousel data={relatedCards} title="Popular right now" description="From small business advertising to big event displays, Modfirst delivers bold." />
                <NewsletterSection />
            </>
        );
    }

    return (
        <>
            <ProductDetail product={product} />
            <ProductCarousel data={relatedCards} title="You may also like" description="From small business advertising to big event displays, Modfirst delivers bold." />
            <NewsletterSection />
        </>
    );
};

export default ProductDetailWrapper;
