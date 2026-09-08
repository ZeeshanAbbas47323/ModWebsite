/**
 * Fallback copy for home sections that are still expected to come from the
 * CMS (`home_sections` in the dashboard) but have no row yet — right now that
 * is every section except `home_hero`, which was seeded. Rather than the
 * section silently rendering nothing, these stand in until real content is
 * added; a page reload after that picks up the CMS version automatically,
 * exactly like the hero slides in `home-hero-slides.ts`.
 */

import type { WhyModfirstViewModel } from "@/lib/map-home-why-modfirst";
import type { OrderProcessViewModel } from "@/lib/map-home-order-process";

// `WhyModfirstViewModel` and the fast-production view model are the same
// shape (the fast-production mapper reuses this one), and both components'
// mosaic images come from a local file rather than the CMS — so a fallback
// here only has to supply the text.
const COMMON_COLORS = {
  backgroundImage: "",
  titleColor: "#000000",
  descriptionColor: "#666666",
  featureTextColor: "#000000",
  bulletColor: "#D3F52E",
  images: [],
};

export const WHY_MODFIRST_FALLBACK: WhyModfirstViewModel = {
  ...COMMON_COLORS,
  title: "Why ModFirst",
  description:
    "Premium custom apparel and printing — DTF transfers, embroidery, UV DTF stickers, t-shirts, hoodies, banners and promotional products, with fast turnaround and no minimum order.",
  features: [
    "Same-day and rush orders available",
    "No minimum order quantity",
    "In-house DTF, DTG and embroidery",
    "Built for print shops and apparel brands alike",
  ],
};

export const FAST_PRODUCTION_FALLBACK: WhyModfirstViewModel = {
  ...COMMON_COLORS,
  title: "Fast Turnaround, Every Time",
  description:
    "Most orders ship within 1–2 business days, with rush production available when you need it sooner.",
  features: [
    "1–2 business day turnaround",
    "Rush orders available",
    "Order tracking from production to delivery",
  ],
};

// Steps have no local icon file the way the mosaic sections do, so a card
// without a `home_order_process` item just renders without one — plain text,
// no fabricated artwork.
export const ORDER_PROCESS_FALLBACK: OrderProcessViewModel = {
  title: "How It Works",
  description: "From upload to delivery, here's what happens after you place an order.",
  backgroundColor: "#000000",
  cardBackgroundColor: "#191717",
  titleColor: "#FFFFFF",
  descriptionColor: "#E3D9D9",
  glowColor: "#C8E100",
  glowOpacity: 0.4,
  steps: [
    {
      id: "upload",
      title: "Upload your design",
      description: "Send us your artwork, or start from one of our templates.",
      imageUrl: "",
      alt: "",
      badge: "1",
    },
    {
      id: "print",
      title: "We print and press",
      description: "Your order goes into production the same day it's approved.",
      imageUrl: "",
      alt: "",
      badge: "2",
    },
    {
      id: "ship",
      title: "Fast shipping",
      description: "Most orders ship within 1–2 business days.",
      imageUrl: "",
      alt: "",
      badge: "3",
    },
  ],
};
