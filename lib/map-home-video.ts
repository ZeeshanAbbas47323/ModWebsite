import type { HomeSection, HomeSectionItem } from "@/services/home-section.service";

export type VideoSectionViewModel = {
  title: string;
  description: string;
  backgroundColor: string;
  titleColor: string;
  descriptionColor: string;
  overlayColor: string;
  overlayOpacity: number;
  buttonText: string;
  buttonUrl: string;
  videoUrl: string;
  videoType: string;
  posterUrl: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  playsInline: boolean;
};

function activeItems(items: HomeSectionItem[] | undefined): HomeSectionItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function mapHomeVideo(
  section: HomeSection | null | undefined
): VideoSectionViewModel | null {
  if (!section || section.is_active === false) return null;

  const settings = section.section_settings ?? {};
  const item =
    activeItems(section.items).find((i) => i.extra_data?.role === "video") ??
    activeItems(section.items)[0];
  const extra = item?.extra_data ?? {};

  const buttonText =
    settings.cta?.button_text?.trim() ||
    item?.button_text?.trim() ||
    "";
  const buttonUrl =
    settings.cta?.button_url?.trim() ||
    item?.button_url?.trim() ||
    "/products";

  return {
    title: section.title?.trim() || item?.title?.trim() || "",
    description:
      section.description?.trim() || item?.description?.trim() || "",
    backgroundColor: section.background_color?.trim() || "#18181b",
    titleColor: settings.title_color?.trim() || "#FFFFFF",
    descriptionColor: settings.description_color?.trim() || "#FFFFFF",
    overlayColor: settings.overlay_color?.trim() || "#000000",
    overlayOpacity:
      typeof settings.overlay_opacity === "number"
        ? settings.overlay_opacity
        : 0.5,
    buttonText,
    buttonUrl: buttonUrl || "/products",
    videoUrl: extra.video_url?.trim() || "",
    videoType: extra.video_type?.trim() || "video/mp4",
    posterUrl: extra.poster_url?.trim() || "",
    autoplay: extra.autoplay !== false,
    loop: extra.loop !== false,
    muted: extra.muted !== false,
    playsInline: extra.plays_inline !== false,
  };
}
