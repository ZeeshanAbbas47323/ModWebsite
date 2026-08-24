import { CheckoutWrapper } from "@/components/checkout/checkout-wrapper";

export const metadata = { title: "Checkout | Modfirst Apparel" };

export default function CheckoutPage() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <CheckoutWrapper />
    </main>
  );
}
