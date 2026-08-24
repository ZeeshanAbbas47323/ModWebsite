import apiClient from "@/lib/axios";

export interface PickupLocation {
  id: number;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  opening_hours?: string;
  is_active?: boolean;
}

export const pickupLocationService = {
  list: async (): Promise<PickupLocation[]> => {
    const { data } = await apiClient.post("/pickup-locations", {
      page: 1,
      limit: 50,
      filters: { is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },
};
