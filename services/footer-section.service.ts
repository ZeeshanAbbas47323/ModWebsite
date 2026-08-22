import apiClient from "@/lib/axios";

export interface FooterLink {
  id: number;
  footer_section_id: number;
  name: string;
  url: string;
  icon: string | null;
  type: string;
  target: string;
  badge: string | null;
  rel: string | null;
  sort_order: number;
}

export interface FooterSection {
  id: number;
  section_key: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  links: FooterLink[];
}

export interface FooterSectionsResponse {
  success: boolean;
  status: number;
  message: string;
  payload: FooterSection[];
}

export const footerSectionService = {
  list: async (): Promise<FooterSection[]> => {
    const { data } = await apiClient.get<FooterSectionsResponse>(
      "/footer-sections"
    );
    return data.payload ?? [];
  },
};
