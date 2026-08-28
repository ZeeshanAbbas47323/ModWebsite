"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import type { WishlistLine } from "@/lib/wishlist-storage";

function Row({ line }: { line: WishlistLine }) {
  const { remove } = useWishlist();
  const { addItem } = useCart();
  const [busy, setBusy] = useState<"cart" | "remove" | null>(null);

  const run = async (job: "cart" | "remove", action: () => Promise<void>) => {
    if (busy) return;
    setBusy(job);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  const isExternal = line.image.startsWith("http");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-[#F4F4F5] p-4 rounded-[20px]">
      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white">
        <Image
          src={line.image}
          alt={line.name}
          fill
          className="object-contain p-2"
          {...(isExternal ? { unoptimized: true } : {})}
        />
      </div>

      <div className="flex-1 min-w-0 text-center sm:text-left">
        {line.slug ? (
          <Link
            href={`/products/${line.slug}`}
            className="font-bold text-black hover:text-primary transition-colors"
          >
            {line.name}
          </Link>
        ) : (
          <p className="font-bold text-black">{line.name}</p>
        )}
        {line.variant_label && (
          <p className="text-xs text-gray-500 mt-0.5">{line.variant_label}</p>
        )}
        {line.price > 0 && (
          <p className="text-sm text-gray-500 mt-1">${line.price.toFixed(2)}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Variant-specific saves can go straight in; anything else needs the
            product page, where the options are chosen. */}
        {line.variant_id || line.slug === undefined ? (
          <Button
            disabled={busy !== null}
            onClick={() =>
              run("cart", async () => {
                await addItem({
                  product: {
                    id: line.product_id,
                    name: line.name,
                    slug: line.slug ?? "",
                    base_price: line.price,
                  },
                  quantity: 1,
                  image: line.image,
                });
              })
            }
          >
            {busy === "cart" ? "Adding…" : "Add to cart"}
          </Button>
        ) : (
          <Link href={`/products/${line.slug}`}>
            <Button variant="outline">View product</Button>
          </Link>
        )}

        <button
          aria-label={`Remove ${line.name} from wishlist`}
          disabled={busy !== null}
          onClick={() => run("remove", () => remove(line.key))}
          className="w-9 h-9 rounded-full text-gray-500 hover:bg-black/10 hover:text-black transition-colors disabled:opacity-50"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { lines, isLoading, count } = useWishlist();

  return (
    <section className="container pt-10 pb-20 md:pt-16 md:pb-32">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-4">
        Wishlist{count > 0 ? ` (${count})` : ""}
      </h1>
      <p className="text-gray-600 text-base md:text-lg max-w-2xl mb-8 md:mb-12">
        Everything you have saved for later.
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[20px] bg-[#F4F4F5] animate-pulse" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 md:py-24 bg-[#F4F4F5] rounded-[24px]">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">
            Nothing saved yet
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link href="/products">
            <Button size="xl">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <Row key={line.key} line={line} />
          ))}
        </div>
      )}
    </section>
  );
}
