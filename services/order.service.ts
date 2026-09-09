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


export interface OrderItemDesign {
  id?: number;
  design_upload_id?: number;
  designUpload?: {
    id: number;
    file_url: string;
    file_name?: string | null;
    edit_url?: string | null;
  } | null;
}

export interface OrderItem {
  id: number;
  order_id?: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;

  unit_price?: string | number;
  total_price?: string | number;
  print_method?: PrintMethod | null;
  custom_text?: string | null;
  product?: {
    id: number;
    name: string;
    slug?: string;
    images?: { image_url: string; is_primary?: boolean }[];
  } | null;
  variant?: {
    id: number;
    sku?: string;
    color?: { name: string } | null;
    size?: { name: string } | null;
  } | null;
  designs?: OrderItemDesign[] | null;
}

export interface OrderAddress {
  id?: number;
  full_name?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export interface Order {
  id: number;

  order_number: string;

  order_code?: string;
  status: string;
  payment_status?: string;

  total_amount: string | number;
  subtotal?: string | number;
  discount_amount?: string | number;
  shipping_fee?: string | number;
  tax_amount?: string | number;
  paid_amount?: string | number;
  delivery_type?: DeliveryType;
  shipping_status?: string | null;
  channel?: string | null;
  notes?: string | null;
  estimated_delivery_date?: string | null;
  cancelled_at?: string | null;
  order_date?: string;
  created_at?: string;
  items?: OrderItem[] | null;
  orderItems?: OrderItem[] | null;
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  pickupLocation?: {
    id: number;
    name: string;
    address_line1?: string;
    city?: string;
    phone?: string;
  } | null;
}


export function orderItemsOf(order: Order): OrderItem[] {
  return order.items ?? order.orderItems ?? [];
}


export function orderItemDesigns(item: OrderItem) {
  return (item.designs ?? [])
    .map((d) => d.designUpload)
    .filter((u): u is NonNullable<typeof u> => !!u?.file_url);
}


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


  reorder: async (code: string): Promise<unknown> => {
    const { data } = await apiClient.post(
      `/orders/${encodeURIComponent(code)}/reorder`,
      {}
    );
    return data.payload ?? data.data ?? data;
  },


  track: async (code: string): Promise<OrderTracking | null> => {
    const { data } = await apiClient.get(
      `/orders/${encodeURIComponent(code)}/track`
    );
    return (data.payload ?? data.data ?? null) as OrderTracking | null;
  },
};


export interface OrderTracking {
  status?: string;
  statusDescription?: string;
  eta?: string | null;
}
