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
    image: "/images/products/dtf-gang-sheet.svg",
    imageAlt: "DTF gang sheet packed with designs",
    primary: { label: "Build Your Gang Sheet", href: "/collections/gang-sheets" },
    secondary: { label: "See Pricing", href: "/pages/pricing" },
    gradient: "linear-gradient(to bottom, #C8E100 0%, #262e01 55%, #000000 100%)",
  },
  {
    id: "custom-apparel",
    eyebrow: "Your Brand. Your Style. Zero Minimums.",
    title: "Custom Apparel Made to Stand Out",
    description:
      "Vivid colors, soft feel, and prints that survive the wash. Whether it's 1 piece or 1,000 — Modfirst delivers apparel your customers will actually want to wear.",
    image: "/images/branding/t-shirts.png",
    imageAlt: "Custom printed t-shirts",
    primary: { label: "Shop Apparel", href: "/collections/custom-t-shirts" },
    secondary: { label: "Start Designing", href: "/pages/custom-order" },
    gradient: "linear-gradient(to bottom, #7BA7FF 0%, #17244a 55%, #000000 100%)",
  },
  {
    id: "uv-dtf",
    eyebrow: "Waterproof. Scratch-Resistant. Built to Last.",
    title: "Make Your Brand Impossible to Ignore",
    description:
      "From tumblers to product packaging — our UV DTF transfers stick to almost any surface with a finish so sharp, people will ask where you got them.",
    image: "/images/branding/tiger-laser-print.jpg",
    imageAlt: "UV DTF sticker transfer",
    primary: { label: "Shop UV DTF", href: "/collections/uv-dtf-transfers" },
    secondary: { label: "Order Samples", href: "/pages/samples" },
    gradient: "linear-gradient(to bottom, #F0A8D0 0%, #40183a 55%, #000000 100%)",
  },
  {
    id: "large-format",
    eyebrow: "Big Prints. Bigger Impact.",
    title: "Turn Heads at Every Event & Location",
    description:
      "Banners, backdrops, yard signs, and posters — printed bold, cut clean, and shipped fast. Modfirst large-format prints make sure your brand shows up everywhere it matters.",
    image: "/images/branding/banner.jpg",
    imageAlt: "Large format banner printing",
    primary: { label: "Shop Banners & Signs", href: "/collections/signs-displays" },
    secondary: { label: "Get a Custom Quote", href: "/pages/contact" },
    gradient: "linear-gradient(to bottom, #FF9E5E 0%, #45230f 55%, #000000 100%)",
  },
  {
    id: "dtf-supplies",
    eyebrow: "Film, Ink, Powder — Ready to Ship",
    title: "Everything Your Press Needs, In Stock",
    description:
      "Keep production moving with DTF film, CMYK ink and adhesive powder from the same shop that prints for thousands of brands. Order before 2 PM and it ships today.",
    image: "/images/products/adhesive-powder.png",
    imageAlt: "DTF adhesive powder and supplies",
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
    image: "/images/branding/girl-with-phone.jpg",
    imageAlt: "Business owner placing a trade order",
    primary: { label: "Apply for Net 30", href: "/net-30" },
    secondary: { label: "Talk to Sales", href: "/contact-us" },
    gradient: "linear-gradient(to bottom, #B9A0FF 0%, #241a45 55%, #000000 100%)",
  },
];

/** How long each slide stays before advancing, in ms. */
export const SLIDE_DURATION = 7000;
