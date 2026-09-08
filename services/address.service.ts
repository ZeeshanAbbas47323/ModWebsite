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

  update: async (
    id: number,
    input: Partial<CreateAddressInput>
  ): Promise<Address> => {
    const { data } = await apiClient.put(`/addresses/${id}`, input);
    return data.payload ?? data.data ?? data;
  },

  /**
   * Soft-deletes through the shared customer endpoint — there is no
   * DELETE /addresses/:id upstream.
   */
  remove: async (id: number): Promise<void> => {
    await apiClient.delete("/common/delete", {
      data: { id, table: "address" },
    });
  },

  /** Promoting an address is just an update; the API clears the previous default. */
  setDefault: async (id: number): Promise<void> => {
    await apiClient.put(`/addresses/${id}`, { is_default: true });
  },
};
