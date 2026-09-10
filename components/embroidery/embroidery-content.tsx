"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/safe-image";

/** Brand embroidery photography, served from the CDN. */
const IMG = "https://storage.modfirst.com/pages/embroidery";

const SERVICES = [
  {
    title: "Digitizing Service",
    body: "Convert your logo or artwork into a production-ready embroidery file.",
    cta: "Digitize my logo",
    href: "/custom-apparel-quote",
    image: `${IMG}/digitizing-service.webp`,
  },
  {
    title: "Embroidery Services",
    body: "Order professional embroidery for hats, polos, jackets, hoodies and more.",
    cta: "Start an embroidery order",
    href: "/custom-apparel-quote",
    image: `${IMG}/embroidery-machine.webp`,
  },
  {
    title: "Bulk Embroidery",
    body: "Order embroidered apparel in larger quantities for businesses, teams and events.",
    cta: "Request bulk pricing",
    href: "/custom-apparel-quote",
    image: `${IMG}/bulk-embroidery.webp`,
  },
];

const STEPS = [
  {
    title: "Send your artwork",
    body: "Upload your logo and provide your garment, placement, colour and quantity details.",
    image: `${IMG}/upload-artwork.webp`,
  },
  {
    title: "We prepare a proof",
    body: "We'll prepare a digital proof for your approval before production begins.",
    image: `${IMG}/digital-proof.webp`,
  },
  {
    title: "We embroider",
    body: "Your approved design is professionally stitched onto your selected items.",
    image: `${IMG}/embroidery-machine.webp`,
  },
  {
    title: "Pickup or shipping",
    body: "We'll notify you when your order is ready for pickup or has shipped.",
    image: `${IMG}/pickup-shipping.webp`,
  },
];

const FAQS = [
  {
    q: "What is embroidery digitizing?",
    a: "Digitizing converts your logo or artwork into a stitch file an embroidery machine can read. It maps every stitch, direction and thread colour, and it is required before any design can be embroidered.",
  },
  {
    q: "Do I need digitizing for every order?",
    a: "Only the first time a design is run. Once a logo has been digitized we keep the file on record, so repeat orders of the same design go straight into production.",
  },
  {
    q: "Will I receive a proof?",
    a: "Yes. We send a digital proof showing size, placement and thread colours, and we wait for your written approval before stitching begins.",
  },
  {
    q: "Can I supply my own garments?",
    a: "You can. Tell us in the quote form that you are supplying the garments and we will price the decoration only. We will confirm the items are suitable for embroidery before you ship them to us.",
  },
  {
    q: "How long does embroidery take?",
    a: "Most orders run 5–7 business days from proof approval. Larger runs and garment sourcing can add time — we confirm a date with your quote.",
  },
  {
    q: "Can you match my exact colours?",
    a: "We match to the closest available thread colours and show them on your proof. Thread is a fixed palette, so an exact Pantone match is not always possible — we will tell you before production if a colour cannot be matched.",
  },
];

export function EmbroideryContent() {
  return (
    <>
      {/* ---------------------------------------------- services ---- */}
      <section className="container pt-10 md:pt-16">
        <span className="text-primary font-bold uppercase tracking-wider text-sm">
          Services
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mt-3 mb-8">
          Choose your embroidery service
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {SERVICES.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              // The image runs to the card edge rather than sitting inside the
              // padding, so the photography reads as the card rather than as a
              // thumbnail dropped into it.
              className="group bg-[#F4F4F5] rounded-[24px] overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg"
            >
              <div className="relative w-full aspect-4/3 overflow-hidden">
                <SafeImage
                  src={service.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="text-xl font-bold text-black mb-2">
                  {service.title}
                </h3>
                <p className="text-[#464545] leading-relaxed mb-6">
                  {service.body}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 font-bold text-black">
                  <span className="underline underline-offset-4 group-hover:text-primary transition-colors">
                    {service.cta}
                  </span>
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- steps ---- */}
      <section className="container pt-10 md:pt-16">
        <span className="text-primary font-bold uppercase tracking-wider text-sm">
          How it works
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mt-3 mb-8">
          How embroidery ordering works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="group bg-[#F4F4F5] rounded-[24px] overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-16/10 overflow-hidden">
                <SafeImage
                  src={step.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 w-9 h-9 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </span>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-black mb-2">
                  {step.title}
                </h3>
                <p className="text-[#464545] leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------- before you order ---- */}
      <section className="container pt-10 md:pt-16">
        {/* The image fills its half of the panel edge to edge. */}
        <div className="bg-[#F4F4F5] rounded-[24px] overflow-hidden flex flex-col lg:flex-row items-stretch">
          <div className="w-full lg:w-1/2">
            <div className="relative w-full h-64 sm:h-80 lg:h-full lg:min-h-[26rem]">
              <SafeImage
                src={`${IMG}/digital-proof.webp`}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-6 md:p-10 lg:py-14 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-5">
              Before you place your order
            </h2>
            <p className="text-[#464545] leading-relaxed mb-4">
              Artwork must be digitized before embroidery production. If you do
              not have an embroidery-ready file, select our Digitizing Service. A
              proof must be approved before stitching begins.
            </p>
            <p className="text-[#464545] leading-relaxed mb-6">
              Final embroidery size, thread colours and placement may be adjusted
              to produce the best stitched result.
            </p>
            <Link
              href="/dtf-artwork-guidelines"
              className="font-bold text-black underline underline-offset-4 hover:text-primary transition-colors"
            >
              View artwork guidelines
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- faqs ---- */}
      <section className="container pt-10 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div>
            <span className="text-primary font-bold uppercase tracking-wider text-sm">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mt-3 mb-4">
              Embroidery FAQs
            </h2>
            <p className="text-[#666] leading-relaxed">
              The questions customers ask most before their first embroidery run.
            </p>
          </div>

          <div className="lg:col-span-2">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={faq.q} value={`embroidery-faq-${i}`}>
                  <AccordionTrigger className="text-left text-base md:text-lg font-bold text-black">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#666] text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- cta ---- */}
      <section className="container pt-10 md:pt-16 pb-10 md:pb-16">
        <div className="bg-black rounded-[24px] p-8 md:p-12 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary opacity-30 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
              Ready to start your embroidery order?
            </h2>
            <p className="text-white/80 max-w-xl mb-8 leading-relaxed">
              Choose the embroidery service that fits your order, upload your
              artwork and provide your garment, quantity, size and placement
              details.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/custom-apparel-quote">
                <Button size="xl">Start an embroidery order</Button>
              </Link>
              <Link href="/custom-apparel-quote">
                {/* A dim grey outline on black was almost invisible; a solid
                    white button reads as the clear second choice. */}
                <Button
                  size="xl"
                  className="bg-white text-black hover:bg-white/90"
                >
                  Request bulk embroidery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
