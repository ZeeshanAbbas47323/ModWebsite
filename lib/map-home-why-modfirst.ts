import type { HomeSection, HomeSectionItem } from "@/services/home-section.service";
import { resolveImageUrl } from "@/lib/image-url";

export type WhyModfirstImage = {
  id: number | string;
  role: string;
  title: string;
  imageUrl: string;
  alt: string;
  span: string;
};

export type WhyModfirstViewModel = {
  title: string;
  description: string;
  backgroundImage: string;
  titleColor: string;
  descriptionColor: string;
  featureTextColor: string;
  bulletColor: string;
  features: string[];
  images: WhyModfirstImage[];
};

function activeItems(items: HomeSectionItem[] | undefined): HomeSectionItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function mapHomeWhyModfirst(
  section: HomeSection | null | undefined
): WhyModfirstViewModel | null {
  if (!section || section.is_active === false) return null;

  const settings = section.section_settings ?? {};
  const items = activeItems(section.items);

  return {
    title: section.title?.trim() || "",
    description: section.description?.trim() || "",
    backgroundImage: section.background_image?.trim() || "",
    titleColor: settings.title_color?.trim() || "#000000",
    descriptionColor: settings.description_color?.trim() || "#666666",
    featureTextColor: settings.feature_text_color?.trim() || "#000000",
    bulletColor: settings.bullet_color?.trim() || "#D3F52E",
    features: Array.isArray(settings.features) ? settings.features : [],
    images: items
      .filter((item) => !!item.image_url?.trim())
      .map((item, index) => ({
        id: item.id ?? index,
        role: item.extra_data?.role || "",
        title: item.title?.trim() || "",
        imageUrl: resolveImageUrl(item.image_url!.trim()),
        alt: item.extra_data?.alt || item.title || "Why Modfirst",
        span: item.extra_data?.span || "",
      })),
  };
}
