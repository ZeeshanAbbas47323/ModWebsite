import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment cancelled | Modfirst Apparel" };

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <section className="container py-20 md:py-28 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Payment cancelled</h1>
        <p className="text-gray-600 max-w-lg mb-2">
          No payment was taken. Your order has not been confirmed.
        </p>
        {order && (
          <p className="text-gray-500 text-sm mb-10">Order reference: {order}</p>
        )}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Link href="/checkout"><Button size="xl">Try again</Button></Link>
          <Link href="/cart"><Button size="xl" variant="outline">Back to cart</Button></Link>
        </div>
      </section>
    </main>
  );
}
