import apiClient from "@/lib/axios";

export interface WebsiteSettings {
  id: number;
  site_name: string;
  site_tagline: string;
  site_description: string;
  logo_url: string;
  logo_white_url: string;
  logo_black_url: string;
  favicon_url: string;
  footer_logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_primary: string;
  font_heading: string;
  contact_email: string;
  support_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  city: string;
  country_code: string;
  postal_code: string;
  province_code: string;
  business_hours: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  youtube_url: string;
  tiktok_url: string;
  pinterest_url: string;
  playstore_url: string;
  appstore_url: string;
  currency: string;
  currency_symbol: string;
  tax_percentage: number;
  default_shipping_fee: number;
  free_shipping_threshold: number;
  min_order_amount: number;
  first_order_discount_enabled: boolean;
  first_order_discount_type: string;
  first_order_discount_value: number;
  first_order_max_discount: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image_url: string;
  order_prefix: string;
}

export const websiteSettingsService = {
  get: async (): Promise<WebsiteSettings> => {
    const { data } = await apiClient.get<{ success: boolean; payload: WebsiteSettings }>(
      "/website-settings"
    );
    return data.payload;
  },
};
