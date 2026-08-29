import apiClient from "@/lib/axios";
import { omitEmpty } from "@/lib/utils";

/** Exactly what the API accepts; the terminal ones are POS-only. */
export type PaymentMethod =
  | "stripe"
  | "paypal"
  | "without_payment"
  | "stripe_and_cash"
  | "paypal_and_cash"
  | "cash"
  | "bank_transfer"
  | "stripe_terminal"
  | "cash_bank_transfer"
  | "cash_stripe_terminal";

/** Methods that never leave the site — no gateway redirect follows. */
export const OFFLINE_METHODS: PaymentMethod[] = [
  "cash",
  "bank_transfer",
  "without_payment",
];

/** Methods that take part now and the rest on collection. */
export const SPLIT_METHODS: PaymentMethod[] = ["stripe_and_cash", "paypal_and_cash"];

export function isOfflineMethod(method: PaymentMethod) {
  return OFFLINE_METHODS.includes(method);
}

export function isSplitMethod(method: PaymentMethod) {
  return SPLIT_METHODS.includes(method);
}

export interface CheckoutSessionInput {
  order_code: string;
  payment_method: PaymentMethod;
  success_url?: string;
  cancel_url?: string;
  /** Both are required for the split methods. */
  online_amount?: number;
  cash_amount?: number;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  /** What the API returns today. */
  session_url?: string;
  /** Other shapes this endpoint has used. */
  url?: string;
  checkout_url?: string;
  redirect_url?: string;
  payment_url?: string;
  session_id?: string;
  payment_reference?: string;
}

/** The gateway URL, whichever key this deployment returns it under. */
export function checkoutRedirectUrl(session: CheckoutSession): string | undefined {
  const candidate =
    session.session_url ??
    session.url ??
    session.checkout_url ??
    session.redirect_url ??
    session.payment_url;
  return candidate?.trim() || undefined;
}

export const paymentService = {
  createCheckoutSession: async (
    input: CheckoutSessionInput
  ): Promise<CheckoutSession> => {
    const { data } = await apiClient.post(
      "/payments/checkout-session",
      omitEmpty({
        ...input,
        // Money must round cleanly or the gateway rejects the session.
        online_amount:
          input.online_amount != null ? Number(input.online_amount.toFixed(2)) : undefined,
        cash_amount:
          input.cash_amount != null ? Number(input.cash_amount.toFixed(2)) : undefined,
      })
    );
    return data.payload ?? data.data ?? data;
  },
};
