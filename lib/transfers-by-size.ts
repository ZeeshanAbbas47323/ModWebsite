/**
 * Configuration for the "Transfers by Size" tool.
 *
 * These values mirror the reference tool at builder.modfirst.com/transfers-by-size,
 * which hardcodes them client-side. There is no API for them yet, so a price
 * change means editing this file — move it behind an endpoint when one exists.
 */

/** Products carrying this vendor open the tool instead of the normal buy box. */
export const TRANSFERS_BY_SIZE_VENDOR_ID = Number(
  process.env.NEXT_PUBLIC_TRANSFERS_BY_SIZE_VENDOR_ID ?? 1
);

export function isTransfersBySizeProduct(vendorId: number | null | undefined) {
  return vendorId === TRANSFERS_BY_SIZE_VENDOR_ID;
}

export const MAX_WIDTH_IN = 22.3;
export const MAX_HEIGHT_IN = 359.8;
export const MIN_SIDE_IN = 0.1;
export const MAX_NOTES = 500;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/** Print quality is judged against this effective DPI. */
export const GOOD_DPI = 200;

export const ACCEPTED_UPLOAD =
  ".png,.jpg,.jpeg,.webp,.ai,.eps,.pdf,image/png,image/jpeg,image/webp,application/pdf,application/postscript";

/** Unit price by printed area, cheapest band first. */
export const PRICE_TIERS = [
  { maxSqIn: 12, pricePerUnit: 0.5 },
  { maxSqIn: 25, pricePerUnit: 0.75 },
  { maxSqIn: 50, pricePerUnit: 1.2 },
  { maxSqIn: 100, pricePerUnit: 2 },
  { maxSqIn: 200, pricePerUnit: 3.5 },
  { maxSqIn: Infinity, pricePerUnit: 5 },
] as const;

/** Volume discounts applied to the unit price. */
export const QUANTITY_BREAKS = [
  { minQty: 1, maxQty: 9, discountPct: 0 },
  { minQty: 10, maxQty: 24, discountPct: 5 },
  { minQty: 25, maxQty: 49, discountPct: 10 },
  { minQty: 50, maxQty: 99, discountPct: 15 },
  { minQty: 100, maxQty: Infinity, discountPct: 20 },
] as const;

export const RUSH_ORDER_FEE = 5;

export const SIZE_PRESETS = [
  { label: "Cap / Hat", w: 2.5, h: 2.5 },
  { label: "Left Chest", w: 4, h: 4 },
  { label: "Full Front", w: 12, h: 14 },
  { label: "Full Back", w: 12, h: 14 },
  { label: "Sleeve", w: 3, h: 10 },
  { label: "Leg Print", w: 4, h: 12 },
] as const;

export const PREVIEW_BACKGROUNDS = [
  { label: "Transparent", value: "transparent" },
  { label: "White", value: "#ffffff" },
  { label: "Light Gray", value: "#d4d4d4" },
  { label: "Dark Gray", value: "#4d4d4d" },
  { label: "Black", value: "#000000" },
] as const;

export interface TransferPricing {
  areaSqIn: number;
  unitPrice: number;
  discountPct: number;
  discountedUnit: number;
  subtotal: number;
  rushAmount: number;
  total: number;
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function priceTransfer(
  widthIn: number,
  heightIn: number,
  quantity: number,
  rushOrder: boolean
): TransferPricing {
  const areaSqIn = widthIn * heightIn;
  const tier =
    PRICE_TIERS.find((t) => areaSqIn <= t.maxSqIn) ??
    PRICE_TIERS[PRICE_TIERS.length - 1];
  const discountPct =
    QUANTITY_BREAKS.find((b) => quantity >= b.minQty && quantity <= b.maxQty)
      ?.discountPct ?? 0;

  const unitPrice = tier.pricePerUnit;
  const discountedUnit = unitPrice * (1 - discountPct / 100);
  const subtotal = discountedUnit * quantity;
  const rushAmount = rushOrder ? RUSH_ORDER_FEE : 0;

  return {
    areaSqIn,
    unitPrice,
    discountPct,
    discountedUnit,
    subtotal,
    rushAmount,
    total: subtotal + rushAmount,
  };
}

/** The next volume break, so the UI can nudge toward it. */
export function nextQuantityBreak(quantity: number) {
  return QUANTITY_BREAKS.find((b) => b.minQty > quantity) ?? null;
}
