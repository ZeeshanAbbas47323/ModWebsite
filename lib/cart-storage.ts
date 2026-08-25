"use client";

import type { DesignUploadInput, PrintMethod } from "@/services/cart.service";

const CART_KEY = "modfirst_cart";

/**
 * A single row in the cart, normalised across the guest (localStorage) cart
 * and the server cart so the UI never has to care which one it is looking at.
 */
export interface CartLine {
  /** Stable identity within the cart. */
  key: string;
  /** Present only for rows that exist on the server. */
  serverId?: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  print_method: PrintMethod | null;
  custom_text: string | null;
  /** Display snapshot, so the cart renders without refetching every product. */
  name: string;
  slug?: string;
  image: string;
  price: number;
  variant_label?: string;
  /** Print files produced by the gang sheet builder, if any. */
  design_uploads?: DesignUploadInput[];
}

/** Two rows are the same line when product, variant and customisation match. */
export function lineKey(
  product_id: number,
  variant_id: number | null,
  print_method: PrintMethod | null,
  custom_text: string | null
) {
  return [product_id, variant_id ?? "-", print_method ?? "-", custom_text ?? "-"].join("|");
}

export function readLocalCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalCart(lines: CartLine[]) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {
    // storage unavailable — cart stays in memory for this session
  }
}

export function clearLocalCart() {
  try {
    window.localStorage.removeItem(CART_KEY);
  } catch {
    // ignore
  }
}
