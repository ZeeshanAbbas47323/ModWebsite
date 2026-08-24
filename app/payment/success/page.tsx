import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata = { title: "Order confirmed | Modfirst Apparel" };

export default function PaymentSuccessPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <Suspense>
        <OrderConfirmation />
      </Suspense>
    </main>
  );
}
