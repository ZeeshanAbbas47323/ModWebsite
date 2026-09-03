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

    return (
        <>
            <Hero />
            <ScrollReveal>
                <ProductCarousel data={categoryCards} title="Our Categories" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <PromotionalBanners />
             <ScrollReveal>
                <CategoryCarousel categoryId={59} title="DTF Transfer Products" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <OurOrderProcess />
            <ScrollReveal>
                <CategoryCarousel categoryId={1} title="DTF Supplies Products" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <ScrollReveal>
                <VideoSection />
            </ScrollReveal>
            <ScrollReveal>
                <CategoryCarousel categoryId={3} title="Blank Tshirts" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <ScrollReveal>
                <WhyModfirst />
            </ScrollReveal>
            <ScrollReveal>
                <FastProduction />
            </ScrollReveal>
            <ScrollReveal>
                <CategoryCarousel categoryId={60} title="Sign & Displays" description="From small business advertising to big event displays, Modfirst delivers bold." />
            </ScrollReveal>
            <ScrollReveal>
                <CustomerFeedback />
            </ScrollReveal>
            <ScrollReveal>
                <CategoryCarousel categoryId={61} title="NEED A HEAT PRESS FOR YOUR DTF TRANSFERS? WE GOT YOUR BACK!" description="From small business advertising to big event displays, Modfirst delivers bold." />
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
