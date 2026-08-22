"use client";

import { Hero } from "@/components/home/hero";
import { PromotionalBanners } from "@/components/home/promotional-banners";
import { OurOrderProcess } from "@/components/home/our-order-process";
import ProductCarousel from "../product/product-carousel";
import { VideoSection } from "@/components/home/video-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CustomerFeedback } from "@/components/home/customer-feedback";
import { BlogSection } from "@/components/home/blog-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { WhyModfirst } from "@/components/home/why-modfirst";
import { FastProduction } from "@/components/home/fast-production";
import { useProductCollection } from "@/hooks/use-products";
import { useProductCategories } from "@/hooks/use-product-categories";
import { mapProductToCard } from "@/lib/map-product-to-card";
import { resolveImageUrl } from "@/lib/image-url";

const fallbackProducts = [
    { title: "DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/booklet.png" },
    { title: "Reflective DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/book.png" },
    { title: "UV DTF", count: "50 Products", img_path: "/images/banners-compositions/shirt.png" },
    { title: "Sublimation", count: "50 Products", img_path: "/images/banners-compositions/launch-box.png" },
    { title: "Custom Patches", count: "50 Products", img_path: "/images/banners-compositions/stamp.svg" },
];

const fallbackSupplyProducts = [
    { title: "DTF Gang Sheets", count: "$25.00", img_path: "/images/products/dtf-gang-sheet.svg" },
    { title: "DTF Printing Services", count: "$25.00", img_path: "/images/products/dtf-printing-service.png" },
    { title: "DTF Ink (CYMK)", count: "$25.00", img_path: "/images/products/dtf-ink-cymk.png" },
    { title: "Adhesive Powder", count: "$25.00", img_path: "/images/products/adhesive-powder.png" },
];

const HomeWrapper = () => {
    const { data: categories } = useProductCategories(null);
    const { data: bestSellers } = useProductCollection("BEST_SELLERS", 8);
    const { data: newest } = useProductCollection("NEWEST", 8);

    const categoryCards = categories?.map((cat) => ({
        id: cat.id,
        title: cat.name,
        count: cat._count?.products ? `${cat._count.products} Products` : "",
        img_path: resolveImageUrl(cat.image_url, "/images/banners-compositions/booklet.png"),
    })) ?? fallbackProducts;

    const productCards = bestSellers?.map(mapProductToCard) ??
        newest?.map(mapProductToCard) ??
        fallbackSupplyProducts;

    return (
        <>
            <Hero />
            <PromotionalBanners />
            <ScrollReveal>
                <ProductCarousel data={categoryCards} title="Our Products" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <OurOrderProcess />
            <ScrollReveal>
                <ProductCarousel data={productCards} title="DTF Supplies Products" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <ScrollReveal>
                <VideoSection />
            </ScrollReveal>
            <ScrollReveal>
                <WhyModfirst />
            </ScrollReveal>
            <ScrollReveal>
                <FastProduction />
            </ScrollReveal>
            <ScrollReveal>
                <CustomerFeedback />
            </ScrollReveal>
            <ScrollReveal>
                <BlogSection />
            </ScrollReveal>
            <ScrollReveal>
                <NewsletterSection />
            </ScrollReveal>
        </>
    )
}

export default HomeWrapper
