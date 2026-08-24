import apiClient from "@/lib/axios";
import type { PrintMethod, DesignUploadInput } from "@/services/cart.service";
import type { CreateAddressInput } from "@/services/address.service";

export type DeliveryType = "home_delivery" | "store_pickup";

export interface OrderItemInput {
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  print_method?: PrintMethod | null;
  custom_text?: string | null;
  design_uploads?: DesignUploadInput[];
}

export interface CreateOrderInput {
  email: string;
  phone?: string;
  full_name?: string;
  delivery_type: DeliveryType;
  shipping_address_id?: number;
  shipping_address?: CreateAddressInput;
  billing_address_id?: number;
  billing_address?: CreateAddressInput;
  pickup_location_id?: number;
  items: OrderItemInput[];
  coupon_code?: string;
  notes?: string;
}

export interface Order {
  id: number;
  /** The customer-facing reference, e.g. "MF-1787438010028-KQV99". */
  order_number: string;
  /** Older deployments named the same value order_code. */
  order_code?: string;
  status: string;
  payment_status?: string;
  /** Money fields arrive as decimal strings. */
  total_amount: string | number;
  subtotal?: string | number;
  discount_amount?: string | number;
  shipping_fee?: string | number;
  tax_amount?: string | number;
  paid_amount?: string | number;
  delivery_type?: DeliveryType;
  order_date?: string;
  created_at?: string;
  items?: unknown[];
}

/** The reference used for payment sessions and order lookups. */
export function orderReference(order: Order): string {
  return order.order_number ?? order.order_code ?? "";
}

export const orderService = {
  create: async (input: CreateOrderInput): Promise<Order> => {
    const { data } = await apiClient.post("/orders", input);
    return data.payload ?? data.data ?? data;
  },

  myOrders: async (page = 1, limit = 10): Promise<{ payload: Order[]; pagination?: unknown }> => {
    const { data } = await apiClient.post("/orders/list", { page, limit });
    return { payload: data.payload ?? data.data ?? [], pagination: data.pagination };
  },

  byCode: async (code: string): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${encodeURIComponent(code)}`);
    return data.payload ?? data.data ?? data;
  },
};
