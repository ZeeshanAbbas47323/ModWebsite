import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ApparelQuoteForm } from "@/components/apparel-quote/apparel-quote-form";

export const metadata: Metadata = {
  title: "Custom Apparel Quote",
  description:
    "Request pricing for custom shirts, hoodies, sweatsuits, hats, uniforms, team apparel and other bulk orders from Modfirst Apparel.",
};

const BENEFITS = [
  {
    title: "Priced for your run",
    body: "Tell us the garments, quantities and print locations — we quote the whole job, not a guess.",
  },
  {
    title: "Any garment, any decoration",
    body: "Screen print, DTF, embroidery and personalisation on shirts, hoodies, hats and uniforms.",
  },
  {
    title: "Bring your own blanks",
    body: "Supplying your own garments is fine — just tell us in the form and we will price the decoration.",
  },
];

const STEPS = [
  "Send us the details below",
  "We review artwork and confirm pricing",
  "You approve the quote and mock-up",
  "We produce and ship your order",
];

export default function CustomApparelQuotePage() {
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
            Bulk &amp; custom orders
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Custom apparel quotes
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Shirts, hoodies, sweatsuits, hats, uniforms and team apparel — tell us
            what you need and we will price it.
          </p>
        </div>
      </section>

      <section className="container pt-10 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
              <h2 className="text-lg font-bold text-black mb-2">{benefit.title}</h2>
              <p className="text-[#464545] leading-relaxed">{benefit.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pt-10 md:pt-16 pb-10 md:pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
            <span className="text-primary font-bold uppercase tracking-wider text-sm">
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mt-3 mb-8">
              Four steps to your order
            </h2>
            <ol className="flex flex-col gap-5">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-[#464545] leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="w-full lg:w-2/3">
            <ApparelQuoteForm />
          </div>
        </div>
      </section>

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
