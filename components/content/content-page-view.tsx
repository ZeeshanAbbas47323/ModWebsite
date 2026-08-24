import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { promoteStrongHeadings, withHeadingIds } from "@/lib/parse-faq-content";
import type { ContentPage } from "@/services/content-page.service";

interface ContentPageViewProps {
  page: ContentPage | null;
  /** Badge above the title, e.g. "Legal". */
  eyebrow?: string;
  /** Used when the CMS record could not be loaded. */
  fallbackTitle: string;
  intro?: string;
}

/** Shared layout for CMS-authored policy pages. */
export function ContentPageView({
  page,
  eyebrow = "Legal",
  fallbackTitle,
  intro,
}: ContentPageViewProps) {
  const { html, headings } = withHeadingIds(
    promoteStrongHeadings(page?.content ?? "")
  );
  // A handful of sections is not worth a contents list; a long policy is.
  const showToc = headings.length >= 3;

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
            {eyebrow}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            {page?.title || fallbackTitle}
          </h1>
          {(intro || page?.meta_desc) && (
            <p className="text-lg text-white/90 max-w-2xl">{intro || page?.meta_desc}</p>
          )}
        </div>
      </section>

      <section className="container pt-10 md:pt-16 pb-10 md:pb-16">
        {page ? (
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {showToc && (
              <nav
                aria-label="On this page"
                className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 bg-[#F4F4F5] rounded-[20px] p-6"
              >
                <p className="text-sm font-bold text-black mb-4">On this page</p>
                <ul className="flex flex-col gap-2.5">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                      <a
                        href={`#${heading.id}`}
                        className="text-sm text-[#464545] hover:text-black hover:underline leading-snug block"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <article
              className="cms-prose flex-1 max-w-3xl"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        ) : (
          <div className="bg-[#F4F4F5] rounded-[24px] p-10 text-center">
            <h2 className="text-2xl font-bold text-black mb-3">
              We could not load this page
            </h2>
            <p className="text-gray-600 mb-8">
              Please try again shortly, or get in touch and we will help directly.
            </p>
            <Link href="/contact-us"><Button size="xl">Contact us</Button></Link>
          </div>
        )}
      </section>

      <ScrollReveal>
        <section className="container pb-10 md:pb-16">
          <div className="bg-black rounded-[24px] p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary opacity-30 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Questions about this policy?
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
