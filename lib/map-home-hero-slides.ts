import type {
  HomeSection,
  HomeSectionItem,
} from "@/services/home-section.service";
import { resolveImageUrl } from "@/lib/image-url";
import type { HeroSlide } from "@/lib/home-hero-slides";

export function mapHomeHeroSlides(
  section: HomeSection | null | undefined
): HeroSlide[] {
  const items = section?.items;
  if (!Array.isArray(items) || items.length === 0) return [];

  const sectionGradient = section?.section_settings?.gradient;

  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item, index) => toSlide(item, index, sectionGradient))
    .filter((slide): slide is HeroSlide => slide !== null);
}

function toSlide(
  item: HomeSectionItem,
  index: number,
  sectionGradient?: string
): HeroSlide | null {
  const title = item.title?.trim();
  const image = item.image_url ? resolveImageUrl(item.image_url, "") : "";

  if (!title && !image) return null;

  return {
    id: item.id != null ? String(item.id) : `hero-${index}`,
    eyebrow: item.extra_data?.eyebrow?.trim() || item.subtitle?.trim() || "",
    title: title ?? "",
    description: item.description?.trim() ?? "",
    image,
    imageAlt: item.extra_data?.alt?.trim() || title || "",
    primary: {
      label: item.button_text?.trim() || "Shop now",
      href: item.button_url?.trim() || item.link_url?.trim() || "/products",
    },
    secondary: {
      label: item.secondary_button_text?.trim() || "",
      href: item.secondary_button_url?.trim() || "",
    },
    gradient:
      item.extra_data?.background_color?.trim() ||
      sectionGradient ||
      "linear-gradient(to bottom, #C8E100 0%, #262e01 55%, #000000 100%)",
  };
}
