import apiClient from "@/lib/axios";

export interface CouponValidation {
  code: string;
  discount_amount: number;
  discount_type?: string;
  discount_value?: number;
  message?: string;
}

export const couponService = {
  validate: async (
    code: string,
    orderAmount: number,
    userId?: number
  ): Promise<CouponValidation> => {
    const { data } = await apiClient.post("/coupons/validate", {
      code,
      order_amount: Number(orderAmount.toFixed(2)),
      ...(userId ? { user_id: userId } : {}),
    });
    const body = data.payload ?? data.data ?? data;
    return {
      code,
      discount_amount: Number(
        body.discount_amount ?? body.discount ?? body.amount ?? 0
      ),
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      message: data.message,
    };
  },
};
