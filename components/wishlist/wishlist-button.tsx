"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWishlist, type WishlistInput } from "@/contexts/wishlist-context";

interface WishlistButtonProps extends WishlistInput {
  /** `icon` floats over a product card; `inline` sits in the buy box. */
  variantStyle?: "icon" | "inline";
  className?: string;
}

export function WishlistButton({
  variantStyle = "icon",
  className,
  ...input
}: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const [busy, setBusy] = useState(false);

  const saved = has(input.product.id, input.variant?.id ?? null);
  const label = saved ? "Remove from wishlist" : "Save to wishlist";

  const onClick = async (e: React.MouseEvent) => {
    // Product cards wrap this in a link; saving should not navigate.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await toggle(input);
    } catch {
      // The wishlist page surfaces failures; keep the card quiet.
    } finally {
      setBusy(false);
    }
  };

  const heart = (
    <svg
      width={variantStyle === "inline" ? 20 : 18}
      height={variantStyle === "inline" ? 20 : 18}
      viewBox="0 0 24 24"
      fill={saved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  if (variantStyle === "inline") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center gap-2 h-14 px-5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-60",
          saved
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-gray-300 text-black hover:border-black",
          className
        )}
      >
        {heart}
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      title={label}
      aria-pressed={saved}
      className={cn(
        "w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-colors disabled:opacity-60",
        saved ? "text-red-600" : "text-black hover:text-red-600",
        className
      )}
    >
      {heart}
    </button>
  );
}
