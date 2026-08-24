import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { FaqAccordion } from "@/components/content/faq-accordion";
import { getContentPage } from "@/services/content-page.server";
import { parseFaqContent } from "@/lib/parse-faq-content";

const PAGE_FILTERS = { content_type: "faq", slug: "faqs" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage(PAGE_FILTERS);
  if (!page) return { title: "FAQs | Modfirst Apparel" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_desc,
    keywords: page.meta_keywords,
  };
}

export default async function FaqPage() {
  const page = await getContentPage(PAGE_FILTERS);
  const entries = parseFaqContent(page?.content ?? "");

  // The CMS stores the title as "FAQS"; a shouted acronym makes a poor H1, so
  // fall back to the spelled-out heading unless an editor set a real title.
  const heading =
    page?.title && page.title !== page.title.toUpperCase()
      ? page.title
      : "Frequently Asked Questions";

  return (
    <main className="flex flex-col flex-1 min-h-screen">
      {/* Header */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary via-[#262e01] to-black" />
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-right opacity-5"
          style={{ backgroundImage: "url('/images/backgrounds/hero-half-frame.svg')" }}
        />
        <div className="container relative z-10 py-14 md:py-20 text-white">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Help Centre
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            {heading}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            {page?.meta_desc ||
              "Everything about our products, turnaround times, shipping and returns — answered."}
          </p>
        </div>
      </section>

      {/* Questions */}
      <section className="container pt-10 md:pt-16 pb-10 md:pb-16">
        {page ? (
          <FaqAccordion entries={entries} fallbackHtml={page.content} />
        ) : (
          <div className="bg-[#F4F4F5] rounded-[24px] p-10 text-center">
            <h2 className="text-2xl font-bold text-black mb-3">We could not load the FAQs</h2>
            <p className="text-gray-600 mb-8">
              Please try again shortly, or get in touch and we will answer directly.
            </p>
            <Link href="/contact-us"><Button size="xl">Contact us</Button></Link>
          </div>
        )}
      </section>

      {/* Still stuck */}
      <ScrollReveal>
        <section className="container pb-10 md:pb-16">
          <div className="bg-black rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary opacity-30 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Still have a question?
              </h2>
              <p className="text-white/70 max-w-lg">
                A real person reviews every message — usually back within a few hours.
              </p>
            </div>
            <Link href="/contact-us" className="relative z-10 shrink-0">
              <Button size="xl">Contact us</Button>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
