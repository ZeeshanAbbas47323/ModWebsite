import apiClient from "@/lib/axios";

export interface Popup {
  id: number;
  title: string;
  message: string;
  image_url: string;
  link_url: string;
  button_text: string;
  popup_type: "announcement" | "coupon" | "newsletter";
  coupon_code: string;
  display_priority: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const popupService = {
  getActive: async (): Promise<Popup[]> => {
    const { data } = await apiClient.get<{ success: boolean; payload: Popup[] }>("/popups");
    return data.payload ?? [];
  },
};
