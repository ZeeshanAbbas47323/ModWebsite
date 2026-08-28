"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistService, type ServerWishlistItem } from "@/services/wishlist.service";
import type { Product, ProductVariant } from "@/services/product.service";
import { resolveImageUrl } from "@/lib/image-url";
import {
  clearLocalWishlist,
  readLocalWishlist,
  wishlistKey,
  writeLocalWishlist,
  type WishlistLine,
} from "@/lib/wishlist-storage";
import { useAuth } from "@/contexts/auth-context";

const PLACEHOLDER_IMAGE = "/images/products/dtf-gang-sheet.svg";
const SNAPSHOT_KEY = "modfirst_wishlist_snapshots";

export interface WishlistInput {
  product: Pick<Product, "id" | "name" | "slug"> & {
    base_price?: number | null;
    sale_price?: number | null;
    images?: Product["images"];
  };
  variant?: ProductVariant | null;
  image?: string;
}

interface WishlistContextValue {
  lines: WishlistLine[];
  count: number;
  isLoading: boolean;
  has: (productId: number, variantId?: number | null) => boolean;
  add: (input: WishlistInput) => Promise<void>;
  remove: (key: string) => Promise<void>;
  toggle: (input: WishlistInput) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function unitPrice(
  product: WishlistInput["product"],
  variant?: ProductVariant | null
): number {
  const raw =
    variant?.sale_price ?? variant?.price ?? product.sale_price ?? product.base_price ?? 0;
  return Number(raw) || 0;
}

function variantLabel(variant?: ProductVariant | null): string | undefined {
  if (!variant) return undefined;
  return (
    [variant.size?.name, variant.color?.name].filter(Boolean).join(" / ") ||
    variant.sku ||
    undefined
  );
}

function productImage(product: WishlistInput["product"]): string {
  const primary = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  return resolveImageUrl(primary?.image_url, PLACEHOLDER_IMAGE);
}

/** Server rows do not always embed the product, so snapshots fill the gaps. */
function mapServerItem(
  item: ServerWishlistItem,
  snapshot?: WishlistLine
): WishlistLine {
  const product = item.product;
  const variant = item.variant;
  return {
    key: wishlistKey(item.product_id, item.variant_id ?? null),
    serverId: item.id,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    name: product?.name ?? snapshot?.name ?? "Product",
    slug: product?.slug ?? snapshot?.slug,
    image: product ? productImage(product) : snapshot?.image ?? PLACEHOLDER_IMAGE,
    price: product ? unitPrice(product, variant) : snapshot?.price ?? 0,
    variant_label: variantLabel(variant) ?? snapshot?.variant_label,
  };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const queryClient = useQueryClient();

  const [localLines, setLocalLines] = useState<WishlistLine[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, WishlistLine>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readLocalWishlist();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalLines(stored);
    try {
      const raw = window.localStorage.getItem(SNAPSHOT_KEY);
      const restored = raw ? (JSON.parse(raw) as Record<string, WishlistLine>) : {};
      for (const line of stored) restored[line.key] = line;
       
      setSnapshots(restored);
    } catch {
      // ignore
    }
     
    setHydrated(true);
  }, []);

  const serverQuery = useQuery({
    queryKey: ["wishlist", "server"],
    queryFn: wishlistService.list,
    enabled: isReady && isAuthenticated,
    staleTime: 30_000,
  });

  const refetchServer = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["wishlist", "server"] }),
    [queryClient]
  );

  // On login, push whatever the guest saved into the account.
  const synced = useRef(false);
  useEffect(() => {
    if (!isReady || !isAuthenticated || !hydrated) {
      if (!isAuthenticated) synced.current = false;
      return;
    }
    if (synced.current) return;
    synced.current = true;

    const pending = readLocalWishlist();
    if (pending.length === 0) return;

    (async () => {
      try {
        for (const line of pending) {
          await wishlistService.create({
            product_id: line.product_id,
            variant_id: line.variant_id,
          });
        }
        clearLocalWishlist();
        setLocalLines([]);
        await refetchServer();
      } catch {
        // Keep the guest list so nothing is lost; it retries on next login.
        synced.current = false;
      }
    })();
  }, [isAuthenticated, isReady, hydrated, refetchServer]);

  const lines: WishlistLine[] = useMemo(() => {
    if (isAuthenticated) {
      return (serverQuery.data ?? []).map((item) =>
        mapServerItem(
          item,
          snapshots[wishlistKey(item.product_id, item.variant_id ?? null)]
        )
      );
    }
    return localLines;
  }, [isAuthenticated, serverQuery.data, localLines, snapshots]);

  const persistLocal = useCallback((next: WishlistLine[]) => {
    setLocalLines(next);
    writeLocalWishlist(next);
  }, []);

  const has = useCallback(
    (productId: number, variantId?: number | null) =>
      lines.some((line) => line.key === wishlistKey(productId, variantId ?? null)),
    [lines]
  );

  const add = useCallback(
    async (input: WishlistInput) => {
      const variant = input.variant ?? null;
      const key = wishlistKey(input.product.id, variant?.id ?? null);
      if (lines.some((line) => line.key === key)) return;

      const snapshot: WishlistLine = {
        key,
        product_id: input.product.id,
        variant_id: variant?.id ?? null,
        name: input.product.name,
        slug: input.product.slug,
        image: input.image ?? productImage(input.product),
        price: unitPrice(input.product, variant),
        variant_label: variantLabel(variant),
      };

      setSnapshots((prev) => {
        const next = { ...prev, [key]: snapshot };
        try {
          window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (isAuthenticated) {
        await wishlistService.create({
          product_id: input.product.id,
          variant_id: variant?.id ?? null,
        });
        await refetchServer();
        return;
      }
      persistLocal([...readLocalWishlist(), snapshot]);
    },
    [lines, isAuthenticated, refetchServer, persistLocal]
  );

  const remove = useCallback(
    async (key: string) => {
      const line = lines.find((l) => l.key === key);
      if (!line) return;
      if (line.serverId) {
        await wishlistService.remove(line.serverId);
        await refetchServer();
        return;
      }
      persistLocal(readLocalWishlist().filter((l) => l.key !== key));
    },
    [lines, refetchServer, persistLocal]
  );

  const toggle = useCallback(
    async (input: WishlistInput) => {
      const key = wishlistKey(input.product.id, input.variant?.id ?? null);
      if (lines.some((line) => line.key === key)) {
        await remove(key);
        return;
      }
      await add(input);
    },
    [lines, add, remove]
  );

  const value: WishlistContextValue = {
    lines,
    count: lines.length,
    isLoading: !hydrated || (isAuthenticated && serverQuery.isLoading),
    has,
    add,
    remove,
    toggle,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
