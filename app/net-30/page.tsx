import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Net30Form } from "@/components/net30/net30-form";

export const metadata: Metadata = {
  title: "Net 30 Terms | Modfirst Apparel",
  description:
    "Apply for a Net 30 trade account with Modfirst Apparel — order now, pay in 30 days.",
};

const BENEFITS = [
  {
    title: "Order now, pay in 30 days",
    body: "Keep your cash working while your prints ship. Invoices are due 30 days after dispatch.",
  },
  {
    title: "One invoice, not twenty",
    body: "Every order in a billing cycle lands on a single statement, so reconciliation stays simple.",
  },
  {
    title: "Built for repeat volume",
    body: "Credit limits grow with your order history — tell us what you need and we will review it.",
  },
];

const STEPS = [
  "Submit the application below",
  "Our credit team reviews it (2–3 business days)",
  "You are emailed a decision and your limit",
  "Check out on terms — no card needed",
];

export default function Net30Page() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary via-[#262e01] to-black" />
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-right opacity-5"
          style={{ backgroundImage: "url('/images/backgrounds/hero-half-frame.svg')" }}
        />
        <div className="container relative z-10 py-14 md:py-20 text-white">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Trade accounts
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Net 30 payment terms
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Approved businesses order today and pay in 30 days. Apply once — it takes a
            couple of minutes.
          </p>
        </div>
      </section>

      {/* Benefits */}
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

      {/* Form + how it works */}
      <section className="container pt-10 md:pt-16 pb-10 md:pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
            <span className="text-primary font-bold uppercase tracking-wider text-sm">
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mt-3 mb-8">
              Four steps to terms
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
            <Net30Form />
          </div>
        </div>
      </section>

      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
    </main>
  );
}
