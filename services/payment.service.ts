import apiClient from "@/lib/axios";

export type PaymentMethod =
  | "stripe"
  | "paypal"
  | "cash"
  | "bank_transfer"
  | "without_payment";

export interface CheckoutSessionInput {
  order_code: string;
  payment_method: PaymentMethod;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSession {
  url?: string;
  checkout_url?: string;
  session_id?: string;
}

export const paymentService = {
  createCheckoutSession: async (
    input: CheckoutSessionInput
  ): Promise<CheckoutSession> => {
    const { data } = await apiClient.post("/payments/checkout-session", input);
    return data.payload ?? data.data ?? data;
  },
};
