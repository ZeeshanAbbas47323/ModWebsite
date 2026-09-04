export interface HeroSlide {
  id: string;
  /** Small line above the headline. */
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** Background wash, so each slide reads as its own thing. */
  gradient: string;
}

/**
 * Hero slides.
 *
 * Static on purpose — the copy is edited here rather than in the CMS. The
 * `home_hero` API and its mapper are still in the codebase for when this goes
 * back to being content-managed.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "gang-sheets",
    eyebrow: "Built for Businesses That Print More",
    title: "More Designs. Less Waste. More Profit.",
    description:
      "Maximize every inch of your transfer sheet. Pack more designs into every order and cut material waste without compromising print quality.",
    image: "/images/hero/print-what-you-imagine.png",
    imageAlt: "Wide-format printer running a custom gang sheet",
    primary: { label: "Build Your Gang Sheet", href: "/products/build-your-dtf-gang-sheets-online" },
    secondary: { label: "See Pricing", href: "/pages/pricing" },
    gradient: "linear-gradient(to bottom, #C8E100 0%, #262e01 55%, #000000 100%)",
  },
  {
    id: "custom-apparel",
    eyebrow: "Your Brand. Your Style. Zero Minimums.",
    title: "Custom Apparel Made to Stand Out",
    description:
      "Vivid colors, soft feel, and prints that survive the wash. Whether it's 1 piece or 1,000 — Modfirst delivers apparel your customers will actually want to wear.",
    image: "/images/hero/promo-products.png",
    imageAlt: "Custom printed tees, hoodies, mugs and tote bags",
    primary: { label: "Shop Apparel", href: "/products" },
    secondary: { label: "Start Designing", href: "/pages/custom-order" },
    gradient: "linear-gradient(to bottom, #7BA7FF 0%, #17244a 55%, #000000 100%)",
  },
  {
    id: "uv-dtf",
    eyebrow: "Waterproof. Scratch-Resistant. Built to Last.",
    title: "Make Your Brand Impossible to Ignore",
    description:
      "From tumblers to product packaging — our UV DTF transfers stick to almost any surface with a finish so sharp, people will ask where you got them.",
    image: "/images/hero/brand-merch-kit.png",
    imageAlt: "Branded merchandise kit with printed cards, tags and apparel",
    primary: { label: "Shop UV DTF", href: "/products/uv-dtf-gang-sheet-transfers-stickers-upload-your-ready-to-print" },
    secondary: { label: "Order Samples", href: "/pages/samples" },
    gradient: "linear-gradient(to bottom, #F0A8D0 0%, #40183a 55%, #000000 100%)",
  },
  {
    id: "large-format",
    eyebrow: "Big Prints. Bigger Impact.",
    title: "Turn Heads at Every Event & Location",
    description:
      "Banners, backdrops, yard signs, and posters — printed bold, cut clean, and shipped fast. Modfirst large-format prints make sure your brand shows up everywhere it matters.",
    image: "/images/hero/wide-format-printer.png",
    imageAlt: "Large-format printer producing a branded banner",
    primary: { label: "Shop Banners & Signs", href: "/products" },
    secondary: { label: "Get a Custom Quote", href: "/pages/contact" },
    gradient: "linear-gradient(to bottom, #FF9E5E 0%, #45230f 55%, #000000 100%)",
  },
  {
    id: "dtf-supplies",
    eyebrow: "Film, Ink, Powder — Ready to Ship",
    title: "Everything Your Press Needs, In Stock",
    description:
      "Keep production moving with DTF film, CMYK ink and adhesive powder from the same shop that prints for thousands of brands. Order before 2 PM and it ships today.",
    image: "/images/hero/heat-press.png",
    imageAlt: "Heat press applying a transfer to a t-shirt",
    primary: { label: "Shop DTF Supplies", href: "/collections/dtf-supplies" },
    secondary: { label: "Browse All Products", href: "/products" },
    gradient: "linear-gradient(to bottom, #5ED6C0 0%, #0f3a34 55%, #000000 100%)",
  },
  {
    id: "net-30",
    eyebrow: "Trade Accounts for Growing Print Shops",
    title: "Order Now, Pay in 30 Days",
    description:
      "Approved businesses keep their cash working while the prints ship. One statement per cycle, credit limits that grow with your order history, and no card at checkout.",
    image: "/images/hero/modfirst-delivery.png",
    imageAlt: "Modfirst order being handed over at the door",
    primary: { label: "Apply for Net 30", href: "/net-30" },
    secondary: { label: "Talk to Sales", href: "/contact-us" },
    gradient: "linear-gradient(to bottom, #B9A0FF 0%, #241a45 55%, #000000 100%)",
  },
  {
    id: "all-over-print",
    eyebrow: "Edge to Edge. Seam to Seam.",
    title: "All-Over Prints That Nobody Else Is Selling",
    description:
      "Sublimation across the whole garment — no cracking, no fading, no print you can feel. Give your customers a piece they cannot find in any high-street shop.",
    image: "/images/hero/all-over-print-tees.png",
    imageAlt: "All-over printed t-shirts in bright patterns",
    primary: { label: "Build a Sublimation Sheet", href: "/products/build-your-own-sublimation-gang-sheets" },
    secondary: { label: "See What's Possible", href: "/products" },
    gradient: "linear-gradient(to bottom, #E85D9B 0%, #4a1030 55%, #000000 100%)",
  },
  {
    id: "production-floor",
    eyebrow: "Printed In-House. Shipped from Maryland.",
    title: "Your Order Never Leaves Our Floor",
    description:
      "No middlemen, no outsourcing, no waiting on someone else's queue. Every sheet is printed, cured and packed under one roof — which is why it goes out the same day.",
    image: "/images/hero/production-floor.png",
    imageAlt: "Modfirst production floor with DTF printers running",
    primary: { label: "Start Your Order", href: "/products" },
    secondary: { label: "About Modfirst", href: "/about-us" },
    gradient: "linear-gradient(to bottom, #F2C230 0%, #4a3a06 55%, #000000 100%)",
  },
];

/** How long each slide stays before advancing, in ms. */
export const SLIDE_DURATION = 7000;
