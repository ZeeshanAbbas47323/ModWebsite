import apiClient from "@/lib/axios";
import type { DeliveryType } from "@/services/order.service";

export interface CheckoutPromotions {
  currency: string;
  currency_symbol: string;
  shipping_fee: number;
  min_order_amount: number | null;
  first_order_discount: {
    enabled: boolean;
    type?: string | null;
    value?: number | null;
    max_discount_amount?: number | null;
    eligible?: boolean;
  };
}

export const promotionService = {
  getCheckoutPromotions: async (
    deliveryType: DeliveryType
  ): Promise<CheckoutPromotions> => {
    const { data } = await apiClient.get("/promotions/checkout", {
      params: { delivery_type: deliveryType },
    });
    const body = data.payload ?? data.data ?? data;
    return {
      currency: body.currency ?? "USD",
      currency_symbol: body.currency_symbol ?? "$",
      shipping_fee: Number(body.shipping_fee ?? 0),
      min_order_amount:
        body.min_order_amount != null ? Number(body.min_order_amount) : null,
      first_order_discount: body.first_order_discount ?? { enabled: false },
    };
  },
};
