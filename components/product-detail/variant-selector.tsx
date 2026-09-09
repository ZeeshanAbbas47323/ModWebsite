"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  isVariantAvailable,
  tracksVariantStock,
  variantStock,
  type ProductVariant,
} from "@/services/product.service";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelect: (variant: ProductVariant | null) => void;
  /** Product-level stock, used when variants are not tracked individually. */
  pooledStock?: number;
  /** Only Apparel & Accessories holds real stock — everything else is made
   * to order, so every option stays pickable regardless of quantity on hand. */
  enforceStock?: boolean;
}

/** Smallest-to-largest, so pills read the way a size chart does. */
const SIZE_ORDER = [
  "xxs", "2xs", "xs", "s", "small", "m", "medium", "l", "large",
  "xl", "xxl", "2xl", "xxxl", "3xl", "4xl", "5xl",
];

function sizeRank(name: string) {
  const index = SIZE_ORDER.indexOf(name.trim().toLowerCase());
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** Pick a readable tick colour for a swatch of the given background. */
function isLightHex(hex?: string) {
  if (!hex) return false;
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  // Perceived brightness (ITU-R BT.601)
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

export function VariantSelector({
  variants,
  selected,
  onSelect,
  pooledStock = 0,
  enforceStock = true,
}: VariantSelectorProps) {
  // Worked out once for the whole product, not per option.
  const perVariantTracking = tracksVariantStock(variants);
  const isAvailable = (variant: ProductVariant) =>
    !enforceStock || isVariantAvailable(variant, { pooledStock, perVariantTracking });

  const [colorIdInput, setColorIdInput] = useState<number | null>(null);
  const [sizeIdInput, setSizeIdInput] = useState<number | null>(null);
  const [skuId, setSkuId] = useState<number | null>(null);

  const colors = useMemo(() => {
    const map = new Map<number, { id: number; name: string; hex_code: string }>();
    for (const v of variants) if (v.color) map.set(v.color.id, v.color);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [variants]);

  const sizes = useMemo(() => {
    const map = new Map<number, { id: number; name: string; display_name?: string }>();
    for (const v of variants) if (v.size) map.set(v.size.id, v.size);
    return [...map.values()].sort(
      (a, b) => sizeRank(a.name) - sizeRank(b.name) || a.name.localeCompare(b.name)
    );
  }, [variants]);

  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;

  // Some products (Foamboard/Posterboard, imported from Shopify) encode
  // several real option axes as one composite Size name — e.g.
  // "Foam Board (Indoors) / 12×12 / 3/16"" is really Board Type / Size /
  // Thickness. There's no separate column for that in this schema, so
  // without this every one of the 50+ combinations rendered as one giant
  // flat, mostly-crossed-out row instead of the tiered picker the
  // reference site actually has. Detected generically: no colour axis, and
  // every size name splits into the same number (2+) of " / "-separated
  // parts.
  const compositeParts = useMemo(() => {
    if (hasColors || !hasSizes) return null;
    const parts = sizes.map((s) => s.name.split(" / ").map((p) => p.trim()));
    const partsCount = parts[0]?.length ?? 0;
    if (partsCount < 2 || !parts.every((p) => p.length === partsCount)) return null;
    return parts;
  }, [hasColors, hasSizes, sizes]);

  // A single option on an axis is not a choice — pre-select it.
  const colorId = colorIdInput ?? (colors.length === 1 ? colors[0].id : null);
  const sizeId = sizeIdInput ?? (sizes.length === 1 ? sizes[0].id : null);

  const findVariant = (cId: number | null, sId: number | null) =>
    variants.find(
      (v) =>
        (!hasColors || v.color?.id === cId) && (!hasSizes || v.size?.id === sId)
    ) ?? null;

  /** Is there a variant on this axis value that pairs with the other axis? */
  const colorAvailable = (cId: number) =>
    variants.some(
      (v) =>
        v.color?.id === cId &&
        (!hasSizes || sizeId == null || v.size?.id === sizeId) &&
        isAvailable(v)
    );

  const sizeAvailable = (sId: number) =>
    variants.some(
      (v) =>
        v.size?.id === sId &&
        (!hasColors || colorId == null || v.color?.id === colorId) &&
        isAvailable(v)
    );

  const commit = (cId: number | null, sId: number | null) => {
    setColorIdInput(cId);
    setSizeIdInput(sId);
    onSelect(findVariant(cId, sId));
  };

  const handleColor = (cId: number) => {
    // Clearing this axis leaves the other one alone.
    if (cId === colorId) {
      commit(null, sizeId);
      return;
    }
    // Switching to a colour that does not stock the chosen size clears the
    // size rather than leaving an impossible pair selected.
    const keepSize =
      sizeId != null &&
      variants.some(
        (v) => v.color?.id === cId && v.size?.id === sizeId && isAvailable(v)
      );
    commit(cId, keepSize ? sizeId : null);
  };

  const handleSize = (sId: number) => {
    if (sId === sizeId) {
      commit(colorId, null);
      return;
    }
    const keepColor =
      colorId != null &&
      variants.some(
        (v) => v.size?.id === sId && v.color?.id === colorId && isAvailable(v)
      );
    commit(keepColor ? colorId : null, sId);
  };

  // A single variant with no colour/size is not a choice at all — e.g. a
  // one-off service (Rush Order, Resend Artwork) that only has one SKU.
  // Rendering an "Options" heading over one unlabeled/blank button forced a
  // click on a no-op before the item could be added to cart. Auto-select it
  // and show nothing instead.
  const onlyVariant = variants.length === 1 ? variants[0] : null;
  const autoSelect = !hasColors && !hasSizes && !!onlyVariant;
  useEffect(() => {
    if (autoSelect && selected?.id !== onlyVariant!.id) onSelect(onlyVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelect, onlyVariant?.id]);

  if (variants.length === 0) return null;
  if (autoSelect) return null;

  if (compositeParts) {
    return (
      <CompositeSizeSelector
        sizes={sizes}
        parts={compositeParts}
        variants={variants}
        selected={selected}
        onSelect={onSelect}
        isAvailable={isAvailable}
        enforceStock={enforceStock}
      />
    );
  }

  // Variants that carry neither colour nor size are listed by SKU instead.
  if (!hasColors && !hasSizes) {
    return (
      <div className="mb-6">
        <p className="text-sm font-bold text-black mb-3">Options</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const isOn = isAvailable(v);
            const active = (selected?.id ?? skuId) === v.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={!isOn}
                onClick={() => {
                  const next = active ? null : v;
                  setSkuId(next?.id ?? null);
                  onSelect(next);
                }}
                className={cn(
                  "h-11 px-4 rounded-xl border text-sm font-medium transition-colors",
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300 hover:border-black",
                  !isOn && "opacity-40 cursor-not-allowed line-through"
                )}
              >
                {v.sku}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const selectedColor = colors.find((c) => c.id === colorId);
  const selectedSize = sizes.find((s) => s.id === sizeId);
  // Show the count that actually governs this variant, so a product-level
  // pool is not reported as "out of stock".
  const stock = selected
    ? perVariantTracking
      ? variantStock(selected)
      : Math.max(variantStock(selected), pooledStock)
    : 0;

  return (
    <div className="flex flex-col gap-6 mb-6">
      {hasColors && (
        <div>
          <p className="text-sm text-black mb-3">
            <span className="font-bold">Color</span>
            {selectedColor && <span className="text-gray-600">: {selectedColor.name}</span>}
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const available = colorAvailable(color.id);
              const active = color.id === colorId;
              return (
                <button
                  key={color.id}
                  type="button"
                  title={available ? color.name : `${color.name} — unavailable`}
                  aria-label={color.name}
                  aria-pressed={active}
                  disabled={!available}
                  onClick={() => handleColor(color.id)}
                  className={cn(
                    "relative w-10 h-10 rounded-full border transition-all",
                    active
                      ? "border-black ring-2 ring-black ring-offset-2"
                      : "border-gray-300 hover:border-black",
                    !available && "opacity-40 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: color.hex_code }}
                >
                  {active && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isLightHex(color.hex_code) ? "#000" : "#fff"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute inset-0 m-auto w-4 h-4"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                  {!available && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-px bg-gray-500 rotate-45" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <p className="text-sm text-black mb-3">
            <span className="font-bold">Size</span>
            {selectedSize && (
              <span className="text-gray-600">
                : {selectedSize.display_name ?? selectedSize.name}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = sizeAvailable(size.id);
              const active = size.id === sizeId;
              return (
                <button
                  key={size.id}
                  type="button"
                  title={size.display_name ?? size.name}
                  aria-pressed={active}
                  disabled={!available}
                  onClick={() => handleSize(size.id)}
                  className={cn(
                    "min-w-[52px] h-11 px-3 rounded-xl border text-sm font-bold transition-colors",
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:border-black",
                    !available && "opacity-40 cursor-not-allowed line-through"
                  )}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {enforceStock && selected && stock > 0 && stock <= 10 && (
        <p className="text-sm font-medium text-orange-600">
          Only {stock} left in stock
        </p>
      )}
      {enforceStock && selected && stock === 0 && (
        <p className="text-sm font-medium text-red-600">This combination is out of stock</p>
      )}
    </div>
  );
}

/** Friendly labels for the common 2-3 axis composite-size cases. */
function axisLabel(index: number, count: number): string {
  if (count === 3) return ["Board Type", "Size", "Thickness"][index];
  if (count === 2) return ["Type", "Size"][index];
  return `Option ${index + 1}`;
}

interface CompositeSizeSelectorProps {
  sizes: { id: number; name: string; display_name?: string }[];
  /** parts[i] is sizes[i].name.split(" / ") — same index, already trimmed. */
  parts: string[][];
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelect: (variant: ProductVariant | null) => void;
  isAvailable: (variant: ProductVariant) => boolean;
  enforceStock?: boolean;
}

/**
 * A tiered picker for products whose "Size" is really several option axes
 * squashed into one composite string (Board Type / Size / Thickness, etc.)
 * — see the comment where this is detected in VariantSelector above.
 */
function CompositeSizeSelector({
  sizes,
  parts,
  variants,
  selected,
  onSelect,
  isAvailable,
  enforceStock = true,
}: CompositeSizeSelectorProps) {
  const axisCount = parts[0]?.length ?? 0;

  const axisValues = useMemo(
    () =>
      Array.from({ length: axisCount }, (_, axis) => {
        const seen = new Set<string>();
        const values: string[] = [];
        for (const p of parts) {
          if (!seen.has(p[axis])) {
            seen.add(p[axis]);
            values.push(p[axis]);
          }
        }
        return values;
      }),
    [parts, axisCount]
  );

  // One selection per axis; null = not chosen yet. Pre-select an axis that
  // only has one possible value, same rule the colour/size axes use.
  const [chosen, setChosen] = useState<(string | null)[]>(() =>
    axisValues.map((values) => (values.length === 1 ? values[0] : null))
  );

  const variantForParts = (candidate: (string | null)[]) => {
    if (candidate.some((v) => v === null)) return null;
    const index = sizes.findIndex((_, i) => parts[i].every((seg, axis) => seg === candidate[axis]));
    if (index === -1) return null;
    const sizeId = sizes[index].id;
    return variants.find((v) => v.size?.id === sizeId) ?? null;
  };

  useEffect(() => {
    onSelect(variantForParts(chosen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen.join("|")]);

  /** Is there any variant with this axis value that's consistent with what's
   *  already chosen on the other axes (unconstrained axes match anything)? */
  const valueAvailable = (axis: number, value: string) =>
    parts.some(
      (p, i) =>
        p[axis] === value &&
        chosen.every((c, j) => j === axis || c === null || p[j] === c) &&
        isAvailable(variants.find((v) => v.size?.id === sizes[i].id) as ProductVariant)
    );

  const setAxis = (axis: number, value: string) => {
    setChosen((prev) => {
      const next = [...prev];
      next[axis] = prev[axis] === value ? null : value;
      return next;
    });
  };

  const selectedVariant = variantForParts(chosen);
  const stock = selectedVariant ? variantStock(selectedVariant) : 0;

  return (
    <div className="flex flex-col gap-6 mb-6">
      {axisValues.map((values, axis) => (
        <div key={axis}>
          <p className="text-sm text-black mb-3">
            <span className="font-bold">{axisLabel(axis, axisCount)}</span>
            {chosen[axis] && <span className="text-gray-600">: {chosen[axis]}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const available = valueAvailable(axis, value);
              const active = chosen[axis] === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  disabled={!available}
                  onClick={() => setAxis(axis, value)}
                  className={cn(
                    "h-11 px-3 rounded-xl border text-sm font-bold transition-colors",
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:border-black",
                    !available && "opacity-40 cursor-not-allowed line-through"
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {enforceStock && selected && stock > 0 && stock <= 10 && (
        <p className="text-sm font-medium text-orange-600">Only {stock} left in stock</p>
      )}
      {enforceStock && selected && stock === 0 && (
        <p className="text-sm font-medium text-red-600">This combination is out of stock</p>
      )}
    </div>
  );
}
