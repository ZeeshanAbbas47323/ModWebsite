"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How fast is your turnaround?",
    a: "Standard orders ship within 24 hours of artwork approval. Rush orders placed before 12:00 PKT ship the same day.",
  },
  {
    q: "Do you have a minimum order?",
    a: "No minimums on DTF transfers, UV DTF or sublimation. You can order a single sheet or thousands — pricing scales with quantity.",
  },
  {
    q: "What file formats should I upload?",
    a: "PNG with transparent background is best. We also accept PDF, AI, PSD and SVG. Designs should be at least 300 DPI at print size.",
  },
  {
    q: "Can you help with artwork?",
    a: "Yes — our artwork team can fix backgrounds, resize files and prep gang sheets. Send us what you have on the form above.",
  },
  {
    q: "Where do you ship?",
    a: "Anywhere in Pakistan via local courier with tracking. International shipping is available on request — message us for a quote.",
  },
];

export function ContactFaq() {
  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        <div>
          <span className="text-primary font-bold uppercase tracking-wider text-sm">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black tracking-tight mt-3 mb-4">
            Common questions
          </h2>
          <p className="text-[#666] text-base md:text-lg leading-relaxed">
            Quick answers to what most customers ask before sending their first order.
            Still stuck? Drop us a line — we love a hard print problem.
          </p>
        </div>

        <div className="lg:col-span-2">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base md:text-lg font-bold text-black">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#666] text-base leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
