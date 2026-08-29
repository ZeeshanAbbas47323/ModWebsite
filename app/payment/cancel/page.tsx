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
        <div className="w-16 h-16 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-6">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-500">
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
          Payment cancelled
        </h1>
        <p className="text-gray-600 max-w-lg mb-2">
          No payment was taken and nothing has been charged. Your basket is exactly as
          you left it, so you can pick up where you stopped.
        </p>
        {order && (
          <p className="text-gray-500 text-sm">
            The order was reserved as{" "}
            <span className="font-medium text-black">{order}</span> and stays unpaid
            until you complete checkout.
          </p>
        )}

        <div className="flex flex-wrap gap-4 justify-center mt-10">
          <Link href="/checkout"><Button size="xl">Try payment again</Button></Link>
          <Link href="/cart"><Button size="xl" variant="outline">Back to cart</Button></Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Trouble paying?{" "}
          <Link href="/contact-us" className="underline text-black">Talk to us</Link> —
          we can take the order another way.
        </p>
      </section>
    </main>
  );
}
