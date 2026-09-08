"use client";

import { Hero } from "@/components/home/hero";
import { PromotionalBanners } from "@/components/home/promotional-banners";
import { OurOrderProcess } from "@/components/home/our-order-process";
import ProductCarousel from "../product/product-carousel";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { NamedCategoryCarousel } from "@/components/home/named-category-carousel";
import { CollectionCarousel } from "@/components/home/collection-carousel";
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
 * Fixed section order for the home page. Each entry renders on its own —
 * a category/collection rail that comes back empty hides itself rather than
 * showing a heading over nothing, so the page degrades gracefully if a
 * category or the products/frontend/collection endpoint has nothing to give.
 */
const HomeWrapper = () => {
    const { data: categories } = useProductCategories(null);

    const categoryCards = categories?.map((cat) => ({
        id: cat.id,
        title: cat.name,
        count: cat._count?.products ? `${cat._count.products} Products` : "",
        img_path: resolveImageUrl(cat.image_url, "/images/banners-compositions/booklet.png"),
        // Categories are collections, not products — link them accordingly.
        href: `/categories/${cat.slug}`,
    })) ?? fallbackProducts;

    return (
        <>
            <Hero />

            {/* Categories — scroll/slide, View All -> every category */}
            <ScrollReveal>
                <ProductCarousel
                    data={categoryCards}
                    title="Our Categories"
                    description="From small business advertising to big event displays, Modfirst delivers bold."
                    viewAllHref="/categories"
                />
            </ScrollReveal>

            {/* Best sellers — ranked by real sales, View All -> /shop/best-sellers */}
            <ScrollReveal>
                <CollectionCarousel
                    type="BEST_SELLERS"
                    title="Best Sellers"
                    description="Our most-ordered products, ranked by real sales."
                    count={5}
                    viewAllHref="/shop/best-sellers"
                />
            </ScrollReveal>

            <ScrollReveal>
                <PromotionalBanners />
            </ScrollReveal>

            <ScrollReveal>
                <OurOrderProcess />
            </ScrollReveal>

            {/* Sublimation (#60) + UV DTF (#62) — one shared rail rather than
                two separate carousels, since they're presented as one
                offering on the site. */}
            <ScrollReveal>
                <CategoryCarousel
                    categoryId={[60, 62]}
                    title="Sublimation & DTF"
                    description="Vibrant, durable transfers for apparel, signage and more."
                    limit={12}
                    viewAllHref="/products"
                />
            </ScrollReveal>

            <ScrollReveal>
                <VideoSection />
            </ScrollReveal>

            <ScrollReveal>
                <CollectionCarousel
                    type="MOST_POPULAR"
                    title="Most Popular"
                    description="What everyone's ordering right now."
                    viewAllHref="/shop/most-popular"
                />
            </ScrollReveal>

            <ScrollReveal>
                <WhyModfirst />
            </ScrollReveal>

            <ScrollReveal>
                <NamedCategoryCarousel name="Business & Industrial" />
            </ScrollReveal>

            <ScrollReveal>
                <FastProduction />
            </ScrollReveal>

            <ScrollReveal>
                <CustomerFeedback />
            </ScrollReveal>

            <ScrollReveal>
                <NamedCategoryCarousel name="Arts & Entertainment" />
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
