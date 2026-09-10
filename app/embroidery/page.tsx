import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { EmbroideryContent } from "@/components/embroidery/embroidery-content";
import { getContentPage } from "@/services/content-page.server";

/**
 * The designed embroidery page. The layout is coded - cards, image steps and an
 * accordion are more than a rich-text body can express - but a content row with
 * slug "embroidery" still supplies the heading and SEO fields, and can take the
 * page down.
 *
 * That row is optional: with none, the page renders the copy below. It is not
 * gated on the row, so this URL always resolves - `/embroidery-services` is the
 * one whose visibility the dashboard controls.
 *
 * `/embroidery-services` is a separate page and reads its own content row.
 */
const PAGE_FILTERS = { slug: "embroidery" } as const;

const FALLBACK_TITLE = "Custom embroidery services";
const FALLBACK_INTRO =
  "Precision embroidery on hats, polos, jackets and hoodies — digitizing, single orders and bulk runs, all stitched in-house.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);

  return {
    title: page?.meta_title || page?.title || FALLBACK_TITLE,
    description: page?.meta_desc || FALLBACK_INTRO,
    ...(page?.meta_keywords ? { keywords: page.meta_keywords } : {}),
    ...(page?.canonical_url
      ? { alternates: { canonical: page.canonical_url } }
      : {}),
  };
}

export default async function EmbroideryPage() {
  const page = await getContentPage(PAGE_FILTERS);

  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary via-[#262e01] to-black" />
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-right opacity-5"
          style={{ backgroundImage: "url('/images/backgrounds/hero-half-frame.svg')" }}
        />
        <div className="container relative z-10 py-14 md:py-20 text-white">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Embroidery
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            {page?.title || FALLBACK_TITLE}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            {page?.meta_desc || FALLBACK_INTRO}
          </p>
        </div>
      </section>

      <EmbroideryContent />

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
