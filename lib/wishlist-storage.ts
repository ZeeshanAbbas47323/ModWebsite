"use client";

const WISHLIST_KEY = "modfirst_wishlist";


export interface WishlistLine {
  key: string;

  serverId?: number;
  product_id: number;
  variant_id: number | null;

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
  }
}

export function clearLocalWishlist() {
  try {
    window.localStorage.removeItem(WISHLIST_KEY);
  } catch {
  }
}
