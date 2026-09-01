/**
 * Currently unused: the home hero is a static slider (lib/home-hero-slides.ts).
 * Kept because the `home_hero` section still exists in the CMS, so switching
 * back to content-managed copy is a one-line change in components/home/hero.tsx.
 */
import type {
  HomeSection,
  HomeSectionItem,
  HomeSectionStat,
  HomeSectionAvatar,
} from "@/services/home-section.service";
import { resolveImageUrl } from "@/lib/image-url";

export type HeroCompositionImage = {
  src: string;
  alt: string;
  role: "primary_image" | "secondary_image" | "stamp";
};

export type HeroViewModel = {
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  backgroundColor: string;
  backgroundImage: string;
  overlayImage: string;
  overlayOpacity: number;
  stats: HomeSectionStat[];
  feedback: {
    text: string;
    rating: number;
    avatarsCount: number;
    avatars: HomeSectionAvatar[];
  };
  buttonText: string;
  buttonUrl: string;
  badge: string;
  composition: HeroCompositionImage[];
  collageImageUrl: string;
  collageMobileImageUrl: string;
};

function activeItems(items: HomeSectionItem[] | undefined): HomeSectionItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function findByRole(
  items: HomeSectionItem[],
  role: string
): HomeSectionItem | undefined {
  return items.find((item) => item.extra_data?.role === role);
}

/**
 * Maps GET home-sections/frontend/home_hero payload → hero UI model.
 * Supports:
 * - Current API: 1 item collage + section_settings (cta/stats/gradient/feedback)
 * - Extended: multiple items with extra_data.role (primary_image/secondary_image/stamp)
 */
export function mapHomeHero(
  section: HomeSection | null | undefined
): HeroViewModel | null {
  if (!section || section.is_active === false) return null;

  const items = activeItems(section.items);
  const settings = section.section_settings ?? {};
  const firstItem = items[0];

  const rolePrimary = findByRole(items, "primary_image");
  const roleSecondary = findByRole(items, "secondary_image");
  const roleStamp = findByRole(items, "stamp");
  const hasRoleComposition = !!(rolePrimary || roleSecondary || roleStamp);

  const composition: HeroCompositionImage[] = [];
  if (hasRoleComposition) {
    if (rolePrimary?.image_url) {
      composition.push({
        role: "primary_image",
        src: resolveImageUrl(rolePrimary.image_url),
        alt: rolePrimary.extra_data?.alt || rolePrimary.title || "Hero image",
      });
    }
    if (roleSecondary?.image_url) {
      composition.push({
        role: "secondary_image",
        src: resolveImageUrl(roleSecondary.image_url),
        alt:
          roleSecondary.extra_data?.alt ||
          roleSecondary.title ||
          "Hero image",
      });
    }
    if (roleStamp?.image_url) {
      composition.push({
        role: "stamp",
        src: resolveImageUrl(roleStamp.image_url),
        alt: roleStamp.extra_data?.alt || roleStamp.title || "Stamp",
      });
    }
  }

  const feedback = settings.customer_feedback;
  const apiAvatars = (feedback?.avatars ?? []).filter((a) => !!a?.image_url);

  const ctaText =
    settings.cta?.button_text?.trim() ||
    firstItem?.button_text?.trim() ||
    "";
  const ctaUrl =
    settings.cta?.button_url?.trim() ||
    firstItem?.button_url?.trim() ||
    "/products";

  // Prefer section-level copy (matches live home_hero response)
  const title =
    section.title?.trim() || firstItem?.title?.trim() || "";
  const subtitle =
    section.subtitle?.trim() || firstItem?.subtitle?.trim() || "";
  const description =
    section.description?.trim() || firstItem?.description?.trim() || "";

  return {
    title,
    subtitle,
    description,
    gradient: settings.gradient?.trim() || "",
    backgroundColor: section.background_color?.trim() || "#030303",
    backgroundImage: section.background_image?.trim() || "",
    overlayImage: settings.overlay_image?.trim() || "",
    overlayOpacity:
      typeof settings.overlay_opacity === "number"
        ? settings.overlay_opacity
        : 0.05,
    stats: Array.isArray(settings.stats) ? settings.stats : [],
    feedback: {
      text: feedback?.text?.trim() || "",
      rating: typeof feedback?.rating === "number" ? feedback.rating : 0,
      avatarsCount:
        typeof feedback?.avatars_count === "number"
          ? feedback.avatars_count
          : apiAvatars.length,
      avatars: apiAvatars,
    },
    buttonText: ctaText,
    buttonUrl: ctaUrl || "/products",
    badge: firstItem?.badge?.trim() || "",
    composition,
    collageImageUrl: hasRoleComposition
      ? ""
      : resolveImageUrl(firstItem?.image_url),
    collageMobileImageUrl: hasRoleComposition
      ? ""
      : resolveImageUrl(firstItem?.mobile_image_url),
  };
}
