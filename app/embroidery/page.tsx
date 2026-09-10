import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { EmbroideryContent } from "@/components/embroidery/embroidery-content";

export const metadata: Metadata = {
  title: "Embroidery Services",
  description:
    "Custom embroidery for hats, polos, jackets and hoodies — digitizing, single orders and bulk embroidery from Modfirst Apparel.",
};

export default function EmbroideryPage() {
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
            Custom embroidery services
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Precision embroidery on hats, polos, jackets and hoodies — digitizing,
            single orders and bulk runs, all stitched in-house.
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
