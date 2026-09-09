"use client";

import type { DesignUploadInput, PrintMethod } from "@/services/cart.service";

const CART_KEY = "modfirst_cart";


export interface CartLine {

  key: string;

  serverId?: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  print_method: PrintMethod | null;
  custom_text: string | null;

  name: string;
  slug?: string;
  image: string;
  price: number;
  variant_label?: string;

  design_uploads?: DesignUploadInput[];
}


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
  }
}

export function clearLocalCart() {
  try {
    window.localStorage.removeItem(CART_KEY);
  } catch {
  }
}
