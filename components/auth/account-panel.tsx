"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { orderService, orderReference } from "@/services/order.service";

export function AccountPanel() {
  const router = useRouter();
  const { user, isAuthenticated, isReady, logout } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) router.replace("/login?redirect=/account");
  }, [isReady, isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => orderService.myOrders(1, 20),
    enabled: isReady && isAuthenticated,
  });

  if (!isReady || !isAuthenticated) return null;

  const orders = data?.payload ?? [];

  return (
    <section className="container py-12 md:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black">My Account</h1>
          <p className="text-gray-600 mt-2">
            {user?.full_name ?? user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={() => logout().then(() => router.push("/"))}>
          Sign out
        </Button>
      </div>

      <h2 className="text-2xl font-bold text-black mb-6">Your orders</h2>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#F4F4F5] animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#F4F4F5] rounded-[24px] p-10 text-center">
          <p className="text-gray-600 mb-6">You have not placed any orders yet.</p>
          <Link href="/products">
            <Button size="xl">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 bg-[#F4F4F5] rounded-2xl px-6 py-5"
            >
              <div>
                <p className="font-bold text-black">{orderReference(order)}</p>
                {(order.order_date ?? order.created_at) && (
                  <p className="text-sm text-gray-500">
                    {new Date(order.order_date ?? order.created_at!).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium capitalize bg-white px-3 py-1 rounded-full">
                {order.status?.replace(/_/g, " ")}
              </span>
              <span className="font-bold text-black">
                ${Number(order.total_amount ?? 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
