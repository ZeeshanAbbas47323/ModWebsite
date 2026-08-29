"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { orderService } from "@/services/order.service";

export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order");
  const { isAuthenticated, isReady } = useAuth();
  const { clearCart, lines } = useCart();

  // The order is placed, so the cart has served its purpose. Gateway payments
  // deliberately keep it until this point, so a cancelled payment can retry.
  const cleared = useRef(false);
  useEffect(() => {
    if (cleared.current || lines.length === 0) return;
    cleared.current = true;
    void clearCart();
  }, [lines.length, clearCart]);

  // Order lookup is customer-authenticated, so guests only ever see the code
  // they were given — which is enough to quote in an email.
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderCode],
    queryFn: () => orderService.byCode(orderCode!),
    enabled: !!orderCode && isReady && isAuthenticated,
    retry: false,
  });

  return (
    <section className="container py-20 md:py-28 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Thank you for your order</h1>

      {orderCode && (
        <p className="text-gray-600 mb-2">
          Your order code is <span className="font-bold text-black">{orderCode}</span>
        </p>
      )}

      <p className="text-gray-600 max-w-lg mb-10">
        We have emailed your confirmation. Most orders ship within 24 hours — we will let you
        know as soon as yours is on its way.
      </p>

      {isLoading && (
        <div className="w-full max-w-md h-32 rounded-[24px] bg-[#F4F4F5] animate-pulse mb-10" />
      )}

      {order && (
        <div className="w-full max-w-md bg-[#F4F4F5] rounded-[24px] p-6 md:p-8 text-left mb-10">
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-bold capitalize">{order.status?.replace(/_/g, " ")}</span>
            </div>
            {order.delivery_type && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-bold capitalize">{order.delivery_type.replace(/_/g, " ")}</span>
              </div>
            )}
            {order.payment_status && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className="font-bold capitalize">{order.payment_status.replace(/_/g, " ")}</span>
              </div>
            )}
            {order.subtotal != null && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-bold">${Number(order.subtotal).toFixed(2)}</span>
              </div>
            )}
            {Number(order.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span className="font-bold">-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            {order.shipping_fee != null && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-bold">${Number(order.shipping_fee).toFixed(2)}</span>
              </div>
            )}
            {order.tax_amount != null && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-bold">${Number(order.tax_amount).toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-300 mt-5 pt-5 flex justify-between items-center">
            <span className="font-bold text-black">Total</span>
            <span className="font-bold text-black text-xl">
              ${Number(order.total_amount ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {isAuthenticated ? (
          <Link href="/account"><Button size="xl">View my orders</Button></Link>
        ) : (
          <Link href="/register"><Button size="xl">Create an account to track it</Button></Link>
        )}
        <Link href="/products"><Button size="xl" variant="outline">Keep shopping</Button></Link>
      </div>
    </section>
  );
}
