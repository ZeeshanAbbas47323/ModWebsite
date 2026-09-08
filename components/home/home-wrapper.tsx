"use client";

import { Hero } from "@/components/home/hero";
import { PromotionalBanners } from "@/components/home/promotional-banners";
import { OurOrderProcess } from "@/components/home/our-order-process";
import ProductCarousel from "../product/product-carousel";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { VideoSection } from "@/components/home/video-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CustomerFeedback } from "@/components/home/customer-feedback";
import { BlogSection } from "@/components/home/blog-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { WhyModfirst } from "@/components/home/why-modfirst";
import { FastProduction } from "@/components/home/fast-production";
import { useProductCategories } from "@/hooks/use-product-categories";
import { resolveImageUrl } from "@/lib/image-url";

const fallbackProducts = [
    { title: "DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/booklet.png" },
    { title: "Reflective DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/book.png" },
    { title: "UV DTF", count: "50 Products", img_path: "/images/banners-compositions/shirt.png" },
    { title: "Sublimation", count: "50 Products", img_path: "/images/banners-compositions/launch-box.png" },
    { title: "Custom Patches", count: "50 Products", img_path: "/images/banners-compositions/stamp.svg" },
];

/**
 * Static sections, in the order they appear between the category rails.
 * A category rail is slotted after each of these; whatever categories are left
 * over run at the end, so adding a category in the dashboard shows up on the
 * home page without a code change.
 */
const INTERLEAVED = [
    PromotionalBanners,
    OurOrderProcess,
    VideoSection,
    WhyModfirst,
    FastProduction,
    CustomerFeedback,
] as const;

const HomeWrapper = () => {
    const { data: categories } = useProductCategories(null);

    const categoryCards = categories?.map((cat) => ({
        id: cat.id,
        title: cat.name,
        count: cat._count?.products ? `${cat._count.products} Products` : "",
        img_path: resolveImageUrl(cat.image_url, "/images/banners-compositions/booklet.png"),
        // Categories are collections, not products — link them accordingly.
        href: `/collections/${cat.slug}`,
    })) ?? fallbackProducts;

    // Category rails were previously pinned to hardcoded ids (59, 1, 3, 60, 61),
    // so they broke whenever the catalogue was re-imported. They are derived
    // from the live categories now; each rail hides itself when empty.
    const railCategories = (categories ?? []).filter(
        (cat) => cat.is_active !== false && (cat._count?.products ?? 1) > 0
    );

    return (
        <>
            <Hero />
            <ScrollReveal>
                <ProductCarousel
                    data={categoryCards}
                    title="Our Categories"
                    description="From small business advertising to big event displays, Modfirst delivers bold."
                />
            </ScrollReveal>

            {INTERLEAVED.map((Section, i) => (
                <div key={i}>
                    <Section />
                    {railCategories[i] && (
                        <ScrollReveal>
                            <CategoryCarousel
                                categoryId={railCategories[i].id}
                                title={railCategories[i].name}
                                description={
                                    railCategories[i].description ??
                                    "From small business advertising to big event displays, Modfirst delivers bold."
                                }
                            />
                        </ScrollReveal>
                    )}
                </div>
            ))}

            {railCategories.slice(INTERLEAVED.length).map((cat) => (
                <ScrollReveal key={cat.id}>
                    <CategoryCarousel
                        categoryId={cat.id}
                        title={cat.name}
                        description={
                            cat.description ??
                            "From small business advertising to big event displays, Modfirst delivers bold."
                        }
                    />
                </ScrollReveal>
            ))}

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
