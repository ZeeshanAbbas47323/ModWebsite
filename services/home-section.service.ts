import apiClient from "@/lib/axios";

export interface HomeSectionStat {
  label: string;
  value: string;
}

export interface HomeSectionAvatar {
  image_url: string;
  fallback?: string;
}

export interface HomeSectionCustomerFeedback {
  text: string;
  rating: number;
  avatars_count: number;
  avatars?: HomeSectionAvatar[];
}

export interface HomeSectionCta {
  button_text?: string;
  button_url?: string;
}

export interface HomeSectionBottomBanner {
  text?: string;
  text_color?: string;
  border_color?: string;
  background_color?: string;
}

export interface HomeSectionPlatformRating {
  platform?: string;
  icon_url?: string;
  rating?: number;
  stars?: number;
  label?: string;
}

export interface HomeSectionSettings {
  stats?: HomeSectionStat[];
  gradient?: string;
  overlay_image?: string;
  overlay_opacity?: number;
  overlay_color?: string;
  customer_feedback?: HomeSectionCustomerFeedback;
  cta?: HomeSectionCta;
  bottom_banner?: HomeSectionBottomBanner;
  card_background_color?: string;
  title_color?: string;
  description_color?: string;
  glow_color?: string;
  glow_opacity?: number;
  features?: string[];
  feature_text_color?: string;
  bullet_color?: string;
  platform_ratings?: HomeSectionPlatformRating[];
  input_placeholder?: string;
  submit_icon_url?: string;
  subscribe_endpoint?: string;
  title_align?: string;
}

export interface HomeSectionItemExtraData {
  role?: string;
  alt?: string;
  position?: string;
  width_class?: string;
  height_class?: string;
  animate?: string;
  eyebrow?: string;
  highlight?: string;
  text_color?: string;
  accent_color?: string;
  background_color?: string;
  description_color?: string;
  price_label?: string;
  price_value?: string;
  video_url?: string;
  video_type?: string;
  poster_url?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  plays_inline?: boolean;
  span?: string;
  rating?: number;
}

export interface HomeSectionItem {
  id?: number;
  section_id?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  mobile_image_url?: string;
  icon?: string | null;
  value?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  secondary_button_text?: string | null;
  secondary_button_url?: string | null;
  link_url?: string | null;
  badge?: string;
  extra_data?: HomeSectionItemExtraData | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface HomeSection {
  id?: number;
  section_key: string;
  section_name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  background_image?: string;
  background_color?: string;
  layout_type?: string;
  section_settings?: HomeSectionSettings | null;
  sort_order?: number;
  is_active?: boolean;
  items?: HomeSectionItem[];
}

export interface HomeSectionResponse {
  success: boolean;
  status: number;
  message: string;
  payload: HomeSection[];
}

export const homeSectionService = {
  getAll: async (): Promise<Record<string, HomeSection>> => {
    const { data } = await apiClient.get<HomeSectionResponse>("/home-sections");
    const map: Record<string, HomeSection> = {};
    for (const section of data.payload ?? []) {
      map[section.section_key] = section;
    }
    return map;
  },
};
