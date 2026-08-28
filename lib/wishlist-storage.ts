"use client";

const WISHLIST_KEY = "modfirst_wishlist";

/**
 * One wishlist row, normalised across the guest (localStorage) list and the
 * server list so the UI never has to care which one it is looking at.
 */
export interface WishlistLine {
  key: string;
  /** Present only for rows that exist on the server. */
  serverId?: number;
  product_id: number;
  variant_id: number | null;
  /** Display snapshot, so the page renders without refetching every product. */
  name: string;
  slug?: string;
  image: string;
  price: number;
  variant_label?: string;
}

export function wishlistKey(product_id: number, variant_id: number | null) {
  return `${product_id}|${variant_id ?? "-"}`;
}

export function readLocalWishlist(): WishlistLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as WishlistLine[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalWishlist(lines: WishlistLine[]) {
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(lines));
  } catch {
    // storage unavailable — the list stays in memory for this session
  }
}

export function clearLocalWishlist() {
  try {
    window.localStorage.removeItem(WISHLIST_KEY);
  } catch {
    // ignore
  }
}
