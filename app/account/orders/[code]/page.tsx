import { use } from "react";
import { OrderDetail } from "@/components/account/order-detail";

export const metadata = { title: "Order details | Modfirst Apparel" };

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <OrderDetail code={decodeURIComponent(code)} />
    </main>
  );
}
