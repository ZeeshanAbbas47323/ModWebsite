/**
 * Fallback content for every home section except `home_hero` (which has its
 * own fallback in `home-hero-slides.ts` and is seeded separately).
 *
 * This is the same real copy the site was built with — verbatim from
 * `docs/home-*-request-body.json`, the reference payloads used to seed the
 * CMS — not placeholder text. If a section's database row is ever missing
 * (a fresh database, a row that got deleted), the page falls back to this
 * instead of rendering nothing; once the CMS row exists, a reload picks that
 * up automatically and this is never used.
 */

import type { WhyModfirstViewModel } from "@/lib/map-home-why-modfirst";
import type { OrderProcessViewModel } from "@/lib/map-home-order-process";
import type { VideoSectionViewModel } from "@/lib/map-home-video";
import type { PromoBannersViewModel } from "@/lib/map-home-promo-banners";
import type { CustomerFeedbackViewModel } from "@/lib/map-home-customer-feedback";

export const WHY_MODFIRST_FALLBACK: WhyModfirstViewModel = {
  title: "Why Modfirst ?",
  description:
    "We deliver premium custom products at prices everyone can afford. From T-shirts, hoodies, banners, yard signs, and business cards to embroidery and transfers, each item is made with care and precision to meet your needs without breaking your budget.",
  backgroundImage: "/images/branding/element-1.svg",
  titleColor: "#000000",
  descriptionColor: "#666666",
  featureTextColor: "#000000",
  bulletColor: "#D3F52E",
  features: [
    "Affordable Custom Quality",
    "Reliable and Fast Shipping",
    "Superior Print and Finish",
    "Exceptional Customer Care",
  ],
  // The mosaic images render from a local file (`home-showcase-images.ts`),
  // not from CMS items, so this stays empty regardless.
  images: [],
};

export const FAST_PRODUCTION_FALLBACK: WhyModfirstViewModel = {
  title: "Fast Production & Reliable Delivery",
  description:
    "Speed matters in the apparel industry and ModFirst understands it. Whether you're restocking your bestsellers, preparing for a pop-up event, or fulfilling last-minute customer requests, ModFirst delivers your DTF transfers fast and ready to press.",
  backgroundImage: "/images/branding/element-2.svg",
  titleColor: "#000000",
  descriptionColor: "#666666",
  featureTextColor: "#000000",
  bulletColor: "#D3F52E",
  features: [
    "Quick Production Times",
    "Reliable Shipping",
    "Fast Turnaround on all Orders",
    "Just Heat Press and Ship to your Customers",
  ],
  images: [],
};

export const ORDER_PROCESS_FALLBACK: OrderProcessViewModel = {
  title: "Our Order Process",
  description: "From small business advertising to big event displays, Modfirst delivers bold.",
  backgroundColor: "#000000",
  cardBackgroundColor: "#191717",
  titleColor: "#FFFFFF",
  descriptionColor: "#E3D9D9",
  glowColor: "#C8E100",
  glowOpacity: 0.4,
  steps: [
    {
      id: "choose",
      title: "Choose Your Perfect Product",
      description:
        "Browse our wide range of custom T-shirts, hoodies, banners, yard signs, business cards, embroidery, and DTF UV DTF transfers. Select the product type, size, and style that matches your vision. Every option is designed to give you creative freedom and professional results.",
      imageUrl: "/images/icons/gallery.svg",
      alt: "Choose Your Perfect Product",
      badge: "1",
    },
    {
      id: "upload",
      title: "Upload or Create Your Design",
      description:
        "Browse our wide range of custom T-shirts, hoodies, banners, yard signs, business cards, embroidery, and DTF UV DTF transfers. Select the product type, size, and style that matches your vision. Every option is designed to give you creative freedom and professional results.",
      imageUrl: "/images/icons/upload.svg",
      alt: "Upload or Create Your Design",
      badge: "2",
    },
    {
      id: "confirm",
      title: "Confirm and Place Your Order",
      description:
        "Browse our wide range of custom T-shirts, hoodies, banners, yard signs, business cards, embroidery, and DTF UV DTF transfers. Select the product type, size, and style that matches your vision. Every option is designed to give you creative freedom and professional results.",
      imageUrl: "/images/icons/cloud.svg",
      alt: "Confirm and Place Your Order",
      badge: "3",
    },
    {
      id: "receive",
      title: "Receive and Enjoy Your Items",
      description:
        "Browse our wide range of custom T-shirts, hoodies, banners, yard signs, business cards, embroidery, and DTF UV DTF transfers. Select the product type, size, and style that matches your vision. Every option is designed to give you creative freedom and professional results.",
      imageUrl: "/images/icons/package.svg",
      alt: "Receive and Enjoy Your Items",
      badge: "4",
    },
  ],
};

export const VIDEO_FALLBACK: VideoSectionViewModel = {
  title: "Watch How Your Custom Prints Come To Life",
  description:
    "See how we print, pack, and deliver custom products with unmatched precision using ModFirst's signature technology.",
  backgroundColor: "#18181b",
  titleColor: "#FFFFFF",
  descriptionColor: "#FFFFFF",
  overlayColor: "#000000",
  overlayOpacity: 0.5,
  buttonText: "Start your Order",
  buttonUrl: "/products",
  videoUrl: "/videos/awarness.mp4",
  videoType: "video/mp4",
  posterUrl: "",
  autoplay: true,
  loop: true,
  muted: true,
  playsInline: true,
};

export const PROMO_BANNERS_FALLBACK: PromoBannersViewModel = {
  cards: [
    {
      role: "left_card",
      title: "Festival Collection",
      description: "We print promotional gifts for every budget.",
      imageUrl: "/images/banners-compositions/booklet.png",
      alt: "Festival Collection Booklets",
      backgroundColor: "#F8D5F0",
      textColor: "#000000",
      descriptionColor: "#464545",
      accentColor: "#E92B2B",
      eyebrow: "Sale up to",
      highlight: "25% off",
      priceLabel: "",
      priceValue: "",
    },
    {
      role: "right_card",
      title: "Custom Packaging your Customers",
      description: "Professionally printed or embroidered",
      imageUrl: "/images/banners-compositions/launch-box.png",
      alt: "Custom Packaging Launch Box",
      backgroundColor: "#F9DAD2",
      textColor: "#000000",
      descriptionColor: "#464545",
      accentColor: "#000000",
      eyebrow: "",
      highlight: "",
      priceLabel: "Only Price",
      priceValue: "$24.00",
    },
  ],
  bottomBanner: {
    text: "Over 1.5 million items shipped every month! Modfirst makes them a reality.",
    textColor: "#000000",
    borderColor: "#C8E100",
    backgroundColor: "#F8FFD9",
  },
};

export const CUSTOMER_FEEDBACK_FALLBACK: CustomerFeedbackViewModel = {
  title: "Our Customer Feedback",
  titleColor: "#000000",
  cardBackgroundColor: "#F8F9FA",
  platformRatings: [
    {
      platform: "google",
      iconUrl: "/images/icons/google.svg",
      rating: 4.2,
      stars: 5,
      label: "4.2 rating on google",
    },
    {
      platform: "facebook",
      iconUrl: "/images/icons/facebook-blue.svg",
      rating: 4.8,
      stars: 5,
      label: "4.8 rating on facebook",
    },
  ],
  reviews: [
    {
      id: "maryam-nafees",
      name: "Maryam Nafees",
      feedback:
        "This place is the best! Jamie and his team go above and beyond always!! Will never go anywhere else!",
      avatar: "/images/avatars/avatar-5.jpg",
      alt: "Maryam Nafees",
      rating: 4,
    },
    {
      id: "sarah-ali",
      name: "Sarah Ali",
      feedback:
        "I'm never let done always on time for pick up . Always the best quality of your not sure just ask you come out more of a professional",
      avatar: "/images/avatars/avatar-6.jpg",
      alt: "Sarah Ali",
      rating: 4,
    },
    {
      id: "ahmed-ashraf",
      name: "Ahmed Ashraf",
      feedback:
        "I have order 3-4 gang sheets. It's a challenge for me to get the perfect size since I design the piece myself. I have not been disappointed.",
      avatar: "/images/avatars/avatar-7.jpg",
      alt: "Ahmed Ashraf",
      rating: 4,
    },
    {
      id: "john-doe",
      name: "John Doe",
      feedback:
        "Fantastic experience from start to finish! The quality is top-notch and the customer service is incredibly responsive.",
      avatar: "/images/avatars/avatar-3.jpg",
      alt: "John Doe",
      rating: 5,
    },
  ],
};
