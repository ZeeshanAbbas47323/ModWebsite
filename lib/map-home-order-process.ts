import type { HomeSection, HomeSectionItem } from "@/services/home-section.service";
import { resolveImageUrl } from "@/lib/image-url";

export type OrderProcessStep = {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  badge: string;
};

export type OrderProcessViewModel = {
  title: string;
  description: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  titleColor: string;
  descriptionColor: string;
  glowColor: string;
  glowOpacity: number;
  steps: OrderProcessStep[];
};

function activeItems(items: HomeSectionItem[] | undefined): HomeSectionItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function mapHomeOrderProcess(
  section: HomeSection | null | undefined
): OrderProcessViewModel | null {
  if (!section || section.is_active === false) return null;

  const settings = section.section_settings ?? {};
  const items = activeItems(section.items);

  return {
    title: section.title?.trim() || "",
    description: section.description?.trim() || "",
    backgroundColor: section.background_color?.trim() || "#000000",
    cardBackgroundColor: settings.card_background_color?.trim() || "#191717",
    titleColor: settings.title_color?.trim() || "#FFFFFF",
    descriptionColor: settings.description_color?.trim() || "#E3D9D9",
    glowColor: settings.glow_color?.trim() || "#C8E100",
    glowOpacity:
      typeof settings.glow_opacity === "number" ? settings.glow_opacity : 0.4,
    steps: items.map((item, index) => ({
      id: item.id ?? index,
      title: item.title?.trim() || "",
      description: item.description?.trim() || "",
      imageUrl: resolveImageUrl(item.image_url?.trim()),
      alt: item.extra_data?.alt || item.title || `Step ${index + 1}`,
      badge: item.badge?.trim() || String(index + 1),
    })),
  };
}
