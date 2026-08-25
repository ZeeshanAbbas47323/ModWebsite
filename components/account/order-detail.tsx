"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { useAuth } from "@/contexts/auth-context";
import {
  orderItemDesigns,
  orderItemsOf,
  orderService,
  type OrderAddress,
  type OrderItem,
} from "@/services/order.service";
import { resolveImageUrl } from "@/lib/image-url";

const PLACEHOLDER = "/images/products/dtf-gang-sheet.svg";

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : "—";
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function AddressBlock({ title, address }: { title: string; address?: OrderAddress | null }) {
  if (!address) return null;
  const lines = [
    address.address_line1,
    address.address_line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);

  return (
    <div>
      <h3 className="text-sm font-bold text-black mb-2">{title}</h3>
      <div className="text-sm text-[#464545] leading-relaxed">
        {address.full_name && <p className="text-black font-medium">{address.full_name}</p>}
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {address.phone && <p className="mt-1">{address.phone}</p>}
        {address.email && <p>{address.email}</p>}
      </div>
    </div>
  );
}

function LineItem({ item }: { item: OrderItem }) {
  const primary =
    item.product?.images?.find((img) => img.is_primary) ?? item.product?.images?.[0];
  const image = resolveImageUrl(primary?.image_url, PLACEHOLDER);
  const isExternal = image.startsWith("http");
  const variantLabel = [item.variant?.size?.name, item.variant?.color?.name]
    .filter(Boolean)
    .join(" / ");
  const designs = orderItemDesigns(item);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-[#F4F4F5] p-4 rounded-[20px]">
      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white">
        <Image
          src={image}
          alt={item.product?.name ?? "Product"}
          fill
          className="object-contain p-2"
          {...(isExternal ? { unoptimized: true } : {})}
        />
      </div>

      <div className="flex-1 min-w-0 text-center sm:text-left">
        {item.product?.slug ? (
          <Link
            href={`/products/${item.product.slug}`}
            className="font-bold text-black hover:text-primary transition-colors"
          >
            {item.product.name}
          </Link>
        ) : (
          <p className="font-bold text-black">{item.product?.name ?? `Product #${item.product_id}`}</p>
        )}

        {variantLabel && <p className="text-xs text-gray-500 mt-0.5">{variantLabel}</p>}
        {item.print_method && (
          <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
            {item.print_method.replace(/_/g, " ")}
          </p>
        )}
        {item.custom_text && (
          <p className="text-xs text-gray-500 mt-0.5">
            Ref <span className="font-medium text-black">{item.custom_text}</span>
          </p>
        )}

        {designs.length > 0 && (
          <ul className="flex flex-col gap-1 mt-2 items-center sm:items-start">
            {designs.map((design) => (
              <li key={design.id ?? design.file_url}>
                <a
                  href={design.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#0056b3] hover:text-[#003d82] underline break-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  {design.file_name || "Design file"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center sm:text-right shrink-0">
        <p className="text-sm text-gray-500">
          {item.quantity} × {money(item.unit_price)}
        </p>
        <p className="font-bold text-black">
          {money(item.total_price ?? Number(item.unit_price ?? 0) * item.quantity)}
        </p>
      </div>
    </div>
  );
}

export function OrderDetail({ code }: { code: string }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace(`/login?redirect=/account/orders/${encodeURIComponent(code)}`);
    }
  }, [isReady, isAuthenticated, router, code]);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["order", code],
    queryFn: () => orderService.byCode(code),
    enabled: isReady && isAuthenticated,
    retry: false,
  });

  if (!isReady || !isAuthenticated) return null;

  if (isLoading) {
    return (
      <section className="container py-12 md:py-20 flex flex-col gap-4">
        <div className="h-10 w-64 rounded-xl bg-[#F4F4F5] animate-pulse" />
        <div className="h-40 rounded-[24px] bg-[#F4F4F5] animate-pulse" />
        <div className="h-64 rounded-[24px] bg-[#F4F4F5] animate-pulse" />
      </section>
    );
  }

  if (isError || !order) {
    return (
      <section className="container py-20 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">
          We could not find that order
        </h1>
        <p className="text-gray-600 mb-8">
          {error instanceof Error ? error.message : "It may belong to a different account."}
        </p>
        <Link href="/account">
          <Button size="xl">Back to my orders</Button>
        </Link>
      </section>
    );
  }

  const items = orderItemsOf(order);
  const placed = formatDate(order.order_date ?? order.created_at);
  const isPickup = order.delivery_type === "store_pickup";

  return (
    <section className="container py-10 md:py-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-6"
      >
        <span aria-hidden>←</span> My orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-black tracking-tight">
            {order.order_number ?? order.order_code}
          </h1>
          {placed && <p className="text-gray-600 mt-2">Placed {placed}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <OrderStatusBadge status={order.payment_status} label="Payment:" />
          {order.shipping_status && (
            <OrderStatusBadge status={order.shipping_status} label="Shipping:" />
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Items */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-black mb-4">
              Items {items.length > 0 && <span className="text-gray-400">({items.length})</span>}
            </h2>
            {items.length === 0 ? (
              <p className="text-gray-500 bg-[#F4F4F5] rounded-[20px] p-6">
                No line items were returned for this order.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <LineItem key={item.id ?? `${item.product_id}-${item.variant_id}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-5">
              {isPickup ? "Pickup" : "Delivery"}
            </h2>

            {isPickup ? (
              order.pickupLocation ? (
                <div className="text-sm text-[#464545] leading-relaxed">
                  <p className="text-black font-medium">{order.pickupLocation.name}</p>
                  {order.pickupLocation.address_line1 && <p>{order.pickupLocation.address_line1}</p>}
                  {order.pickupLocation.city && <p>{order.pickupLocation.city}</p>}
                  {order.pickupLocation.phone && <p className="mt-1">{order.pickupLocation.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Collect in store.</p>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AddressBlock title="Shipping address" address={order.shippingAddress} />
                <AddressBlock title="Billing address" address={order.billingAddress} />
                {!order.shippingAddress && !order.billingAddress && (
                  <p className="text-sm text-gray-500">No address was returned for this order.</p>
                )}
              </div>
            )}

            {order.estimated_delivery_date && (
              <p className="text-sm text-gray-600 mt-5">
                Estimated delivery: {formatDate(order.estimated_delivery_date)}
              </p>
            )}
            {order.notes && (
              <p className="text-sm text-gray-600 mt-5">
                <span className="font-bold text-black">Notes: </span>
                {order.notes}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
          <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8">
            <h2 className="text-xl font-bold text-black mb-6">Order summary</h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-bold">{money(order.subtotal)}</span>
              </div>
              {Number(order.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span className="font-bold">-{money(order.discount_amount)}</span>
                </div>
              )}
              {order.shipping_fee != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold">{money(order.shipping_fee)}</span>
                </div>
              )}
              {order.tax_amount != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-bold">{money(order.tax_amount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-300 mt-5 pt-5 flex justify-between items-center">
              <span className="font-bold text-black text-lg">Total</span>
              <span className="font-bold text-black text-xl">{money(order.total_amount)}</span>
            </div>

            {Number(order.paid_amount ?? 0) > 0 && (
              <div className="flex justify-between text-sm mt-3">
                <span className="text-gray-600">Paid</span>
                <span className="font-bold text-green-700">{money(order.paid_amount)}</span>
              </div>
            )}

            <Link href="/products" className="block mt-8">
              <Button size="xl" className="w-full">Order again</Button>
            </Link>
            <Link
              href="/contact-us"
              className="block text-center text-sm text-gray-600 underline mt-4"
            >
              Need help with this order?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
