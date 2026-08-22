import type { HomeSection, HomeSectionItem } from "@/services/home-section.service";
import { resolveImageUrl } from "@/lib/image-url";

export type PromoCardViewModel = {
  role: "left_card" | "right_card" | string;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  backgroundColor: string;
  textColor: string;
  descriptionColor: string;
  accentColor: string;
  eyebrow: string;
  highlight: string;
  priceLabel: string;
  priceValue: string;
};

export type PromoBannersViewModel = {
  cards: PromoCardViewModel[];
  bottomBanner: {
    text: string;
    textColor: string;
    borderColor: string;
    backgroundColor: string;
  } | null;
};

function activeItems(items: HomeSectionItem[] | undefined): HomeSectionItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function mapCard(item: HomeSectionItem): PromoCardViewModel {
  const extra = item.extra_data ?? {};
  return {
    role: extra.role || "",
    title: item.title?.trim() || "",
    description: item.description?.trim() || "",
    imageUrl: resolveImageUrl(item.image_url?.trim()),
    alt: extra.alt || item.title || "Promo banner",
    backgroundColor: extra.background_color || "#F8D5F0",
    textColor: extra.text_color || "#000000",
    descriptionColor: extra.description_color || "#464545",
    accentColor: extra.accent_color || "#000000",
    eyebrow: extra.eyebrow?.trim() || item.subtitle?.trim() || "",
    highlight: extra.highlight?.trim() || item.badge?.trim() || "",
    priceLabel: extra.price_label?.trim() || item.subtitle?.trim() || "",
    priceValue: extra.price_value?.trim() || item.badge?.trim() || "",
  };
}

export function mapHomePromoBanners(
  section: HomeSection | null | undefined
): PromoBannersViewModel | null {
  if (!section || section.is_active === false) return null;

  const items = activeItems(section.items);
  const bottom = section.section_settings?.bottom_banner;

  return {
    cards: items.map(mapCard),
    bottomBanner: bottom?.text
      ? {
          text: bottom.text,
          textColor: bottom.text_color || "#000000",
          borderColor: bottom.border_color || "#C8E100",
          backgroundColor: bottom.background_color || "#F8FFD9",
        }
      : null,
  };
}
