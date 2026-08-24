import apiClient from "@/lib/axios";

export interface Address {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
  type?: "shipping" | "billing";
}

export type CreateAddressInput = Omit<Address, "id">;

export const addressService = {
  list: async (): Promise<Address[]> => {
    const { data } = await apiClient.post("/addresses", {
      page: 1,
      limit: 50,
      filters: { is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },

  create: async (input: CreateAddressInput): Promise<Address> => {
    const { data } = await apiClient.post("/addresses?action=create", input);
    return data.payload ?? data.data ?? data;
  },
};
