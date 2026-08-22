import type { HomeSection, HomeSectionItem } from "@/services/home-section.service";
import { resolveImageUrl } from "@/lib/image-url";

export type PlatformRatingViewModel = {
  platform: string;
  iconUrl: string;
  rating: number;
  stars: number;
  label: string;
};

export type ReviewViewModel = {
  id: number | string;
  name: string;
  feedback: string;
  avatar: string;
  alt: string;
  rating: number;
};

export type CustomerFeedbackViewModel = {
  title: string;
  titleColor: string;
  cardBackgroundColor: string;
  platformRatings: PlatformRatingViewModel[];
  reviews: ReviewViewModel[];
};

function activeItems(items: HomeSectionItem[] | undefined): HomeSectionItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function parseRating(item: HomeSectionItem): number {
  const fromExtra = item.extra_data?.rating;
  if (typeof fromExtra === "number") return Math.max(0, Math.min(5, fromExtra));
  const fromBadge = Number(item.badge);
  if (!Number.isNaN(fromBadge)) return Math.max(0, Math.min(5, fromBadge));
  return 0;
}

export function mapHomeCustomerFeedback(
  section: HomeSection | null | undefined
): CustomerFeedbackViewModel | null {
  if (!section || section.is_active === false) return null;

  const settings = section.section_settings ?? {};
  const items = activeItems(section.items);

  return {
    title: section.title?.trim() || "",
    titleColor: settings.title_color?.trim() || "#000000",
    cardBackgroundColor: settings.card_background_color?.trim() || "#F8F9FA",
    platformRatings: (settings.platform_ratings ?? []).map((r) => ({
      platform: r.platform?.trim() || "",
      iconUrl: r.icon_url?.trim() || "",
      rating: typeof r.rating === "number" ? r.rating : 0,
      stars: typeof r.stars === "number" ? r.stars : 5,
      label: r.label?.trim() || "",
    })),
    reviews: items.map((item, index) => ({
      id: item.id ?? index,
      name: item.title?.trim() || "",
      feedback: item.description?.trim() || "",
      avatar: resolveImageUrl(item.image_url?.trim()),
      alt: item.extra_data?.alt || item.title || "Customer",
      rating: parseRating(item),
    })),
  };
}
