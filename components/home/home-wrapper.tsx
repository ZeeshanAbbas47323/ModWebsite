"use client";

import { Hero } from "@/components/home/hero";
import { PromotionalBanners } from "@/components/home/promotional-banners";
import { OurOrderProcess } from "@/components/home/our-order-process";
import ProductCarousel from "../product/product-carousel";
import { CategoryTreeCarousel } from "@/components/home/category-tree-carousel";
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
  {
    title: "DTF Transfer",
    count: "50 Products",
    img_path: "/images/banners-compositions/booklet.png",
  },
  {
    title: "Reflective DTF Transfer",
    count: "50 Products",
    img_path: "/images/banners-compositions/book.png",
  },
  {
    title: "UV DTF",
    count: "50 Products",
    img_path: "/images/banners-compositions/shirt.png",
  },
  {
    title: "Sublimation",
    count: "50 Products",
    img_path: "/images/banners-compositions/launch-box.png",
  },
  {
    title: "Custom Patches",
    count: "50 Products",
    img_path: "/images/banners-compositions/stamp.svg",
  },
];

/**
 * Fixed section order for the home page (owner-specified). Each
 * category rail comes from a real main category (matched by its real,
 * live id) and shows every product under it — the parent itself plus all of
 * its subcategories — capped to a handful with a "View All" link to that
 * category's own page for the rest, rather than dumping the whole catalogue
 * into the scroller. A rail that comes back empty hides itself rather than
 * showing a heading over nothing.
 */
const HomeWrapper = () => {
  const { data: categories } = useProductCategories(null);

  const categoryCards =
    categories?.map((cat) => ({
      id: cat.id,
      title: cat.name,
      count: cat._count?.products ? `${cat._count.products} Products` : "",
      img_path: resolveImageUrl(
        cat.image_url,
        "/images/banners-compositions/booklet.png",
      ),
      // Categories are collections, not products — link them accordingly.
      href: `/categories/${cat.slug}`,
    })) ?? fallbackProducts;

  return (
    <>
      <Hero />

      {/* DTF Transfers */}
      <ScrollReveal>
        <CategoryTreeCarousel
          categoryId={66}
          title="Transfers"
          description="Vibrant, durable transfers ready to press onto almost any fabric."
          viewAllHref="/categories/dtf-transfers"
        />
      </ScrollReveal>

      <ScrollReveal>
        <PromotionalBanners />
      </ScrollReveal>

      {/* Hat Heat Press */}
      <ScrollReveal>
        <CategoryTreeCarousel
          categoryId={85}
          title="Hat Heat Press"
          viewAllHref="/categories/hat-heat-press"
        />
      </ScrollReveal>

      <ScrollReveal>
        <OurOrderProcess />
      </ScrollReveal>

      {/* DTF Supplies */}
      <ScrollReveal>
        <CategoryTreeCarousel
          categoryId={87}
          title="DTF Supplies"
          viewAllHref="/categories/dtf-supplies-main"
        />
      </ScrollReveal>

      <ScrollReveal>
        <VideoSection />
      </ScrollReveal>

      {/* Apparel & Accessories */}
      <ScrollReveal>
        <CategoryTreeCarousel
          categoryId={72}
          title="Apparel & Accessories"
          viewAllHref="/categories/apparel"
        />
      </ScrollReveal>

      <ScrollReveal>
        <WhyModfirst />
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
        <FastProduction />
      </ScrollReveal>

      {/* Signage & Displays */}
      <ScrollReveal>
        <CategoryTreeCarousel
          categoryId={79}
          title="Signage & Displays"
          viewAllHref="/categories/signage-displays"
        />
      </ScrollReveal>

      <ScrollReveal>
        <CustomerFeedback />
      </ScrollReveal>

      <ScrollReveal>
        <BlogSection />
      </ScrollReveal>
      {/* Categories — scroll/slide, View All -> every category */}
      <ScrollReveal>
        <ProductCarousel
          data={categoryCards}
          title="Our Categories"
          description="From small business advertising to big event displays, Modfirst delivers bold."
          viewAllHref="/categories"
        />
      </ScrollReveal>
      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </>
  );
};

export default HomeWrapper;
