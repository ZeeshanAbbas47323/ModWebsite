"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  isVariantAvailable,
  variantStock,
  type ProductVariant,
} from "@/services/product.service";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onSelect: (variant: ProductVariant | null) => void;
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

export function VariantSelector({ variants, selected, onSelect }: VariantSelectorProps) {
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
        isVariantAvailable(v)
    );

  const sizeAvailable = (sId: number) =>
    variants.some(
      (v) =>
        v.size?.id === sId &&
        (!hasColors || colorId == null || v.color?.id === colorId) &&
        isVariantAvailable(v)
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
        (v) => v.color?.id === cId && v.size?.id === sizeId && isVariantAvailable(v)
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
        (v) => v.size?.id === sId && v.color?.id === colorId && isVariantAvailable(v)
      );
    commit(keepColor ? colorId : null, sId);
  };

  if (variants.length === 0) return null;

  // Variants that carry neither colour nor size are listed by SKU instead.
  if (!hasColors && !hasSizes) {
    return (
      <div className="mb-6">
        <p className="text-sm font-bold text-black mb-3">Options</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const available = isVariantAvailable(v);
            const active = (selected?.id ?? skuId) === v.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={!available}
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
                  !available && "opacity-40 cursor-not-allowed line-through"
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
  const stock = selected ? variantStock(selected) : 0;

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

      {selected && stock > 0 && stock <= 10 && (
        <p className="text-sm font-medium text-orange-600">
          Only {stock} left in stock
        </p>
      )}
      {selected && stock === 0 && (
        <p className="text-sm font-medium text-red-600">This combination is out of stock</p>
      )}
    </div>
  );
}
