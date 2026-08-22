import type { HomeSection } from "@/services/home-section.service";

export type NewsletterViewModel = {
  title: string;
  description: string;
  titleColor: string;
  descriptionColor: string;
  gradient: string;
  inputPlaceholder: string;
  submitIconUrl: string;
  subscribeEndpoint: string;
};

export function mapHomeNewsletter(
  section: HomeSection | null | undefined
): NewsletterViewModel | null {
  if (!section || section.is_active === false) return null;

  const settings = section.section_settings ?? {};

  return {
    title: section.title?.trim() || "",
    description: section.description?.trim() || "",
    titleColor: settings.title_color?.trim() || "#000000",
    descriptionColor: settings.description_color?.trim() || "#464545",
    gradient:
      settings.gradient?.trim() ||
      "linear-gradient(to bottom, #D3F52E 0%, #e8fa85 50%, rgba(255,255,255,0.9) 100%)",
    inputPlaceholder: settings.input_placeholder?.trim() || "Email",
    submitIconUrl: settings.submit_icon_url?.trim() || "/images/icons/send.svg",
    subscribeEndpoint:
      settings.subscribe_endpoint?.trim() || "/newsletters/subscribe",
  };
}
