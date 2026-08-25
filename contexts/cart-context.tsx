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
import {
  cartService,
  designUploadsOf,
  type DesignUploadInput,
  type PrintMethod,
  type ServerCartItem,
} from "@/services/cart.service";
import { couponService } from "@/services/coupon.service";
import type { Product, ProductVariant } from "@/services/product.service";
import { resolveImageUrl } from "@/lib/image-url";
import {
  clearLocalCart,
  lineKey,
  readLocalCart,
  writeLocalCart,
  type CartLine,
} from "@/lib/cart-storage";
import { useAuth } from "@/contexts/auth-context";

const PLACEHOLDER_IMAGE = "/images/products/dtf-gang-sheet.svg";
const COUPON_KEY = "modfirst_coupon";
const SNAPSHOT_KEY = "modfirst_cart_snapshots";

interface AppliedCoupon {
  code: string;
  discount_amount: number;
}

export interface AddToCartInput {
  product: Pick<Product, "id" | "name" | "slug"> & {
    base_price?: number | null;
    sale_price?: number | null;
    images?: Product["images"];
  };
  variant?: ProductVariant | null;
  quantity?: number;
  print_method?: PrintMethod | null;
  custom_text?: string | null;
  /** Explicit image, when the caller already resolved one. */
  image?: string;
  /** Print files produced by the gang sheet builder. */
  design_uploads?: DesignUploadInput[];
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (input: AddToCartInput) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function unitPrice(
  product: AddToCartInput["product"],
  variant?: ProductVariant | null
): number {
  const raw =
    variant?.sale_price ??
    variant?.price ??
    product.sale_price ??
    product.base_price ??
    0;
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

function productImage(product: AddToCartInput["product"]): string {
  const primary =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  return resolveImageUrl(primary?.image_url, PLACEHOLDER_IMAGE);
}

/**
 * Server rows do not always embed the full product, so display details that
 * were captured at add-to-cart time are kept as a fallback.
 */
function mapServerItem(item: ServerCartItem, snapshot?: CartLine): CartLine {
  const product = item.product;
  const variant = item.variant;
  const price = product
    ? unitPrice(product, variant)
    : snapshot?.price ?? 0;

  // Files stored against the row win over the snapshot: the snapshot holds the
  // pre-signed URL captured at add time, which expires.
  const serverUploads = designUploadsOf(item);

  return {
    key: `server-${item.id}`,
    serverId: item.id,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    quantity: item.quantity,
    print_method: item.print_method ?? null,
    custom_text: item.custom_text ?? null,
    name: product?.name ?? snapshot?.name ?? "Product",
    slug: product?.slug ?? snapshot?.slug,
    image: product ? productImage(product) : snapshot?.image ?? PLACEHOLDER_IMAGE,
    price,
    variant_label: variantLabel(variant) ?? snapshot?.variant_label,
    design_uploads: serverUploads.length ? serverUploads : snapshot?.design_uploads,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady, user } = useAuth();
  const queryClient = useQueryClient();

  const [localLines, setLocalLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  // Display details keyed by lineKey, so server rows can be rendered fully
  // even when the API returns only ids.
  const [snapshots, setSnapshots] = useState<Record<string, CartLine>>({});
  useEffect(() => {
    // Same as the auth session: the guest cart lives in localStorage and can
    // only be read once the client has mounted.
    const stored = readLocalCart();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalLines(stored);
    try {
      const rawSnapshots = window.localStorage.getItem(SNAPSHOT_KEY);
      const restored = rawSnapshots
        ? (JSON.parse(rawSnapshots) as Record<string, CartLine>)
        : {};
      for (const line of stored) restored[line.key] = line;
       
      setSnapshots(restored);
    } catch {
      // ignore
    }
    try {
      const rawCoupon = window.localStorage.getItem(COUPON_KEY);
       
      if (rawCoupon) setCoupon(JSON.parse(rawCoupon) as AppliedCoupon);
    } catch {
      // ignore
    }
     
    setHydrated(true);
  }, []);

  const persistLocal = useCallback((lines: CartLine[]) => {
    setLocalLines(lines);
    writeLocalCart(lines);
  }, []);

  const serverQuery = useQuery({
    queryKey: ["cart", "server"],
    queryFn: cartService.list,
    enabled: isReady && isAuthenticated,
    staleTime: 30_000,
  });

  const refetchServer = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["cart", "server"] }),
    [queryClient]
  );

  // On login, push whatever the guest collected into the account cart.
  const syncedFor = useRef<boolean>(false);
  useEffect(() => {
    if (!isReady || !isAuthenticated || !hydrated) {
      if (!isAuthenticated) syncedFor.current = false;
      return;
    }
    if (syncedFor.current) return;
    syncedFor.current = true;

    const pending = readLocalCart();
    if (pending.length === 0) return;

    (async () => {
      setIsSyncing(true);
      try {
        for (const line of pending) {
          await cartService.create({
            product_id: line.product_id,
            variant_id: line.variant_id,
            quantity: line.quantity,
            print_method: line.print_method,
            custom_text: line.custom_text,
            design_uploads: line.design_uploads,
          });
        }
        clearLocalCart();
        setLocalLines([]);
        await refetchServer();
      } catch {
        // Keep the guest cart intact so nothing is lost; it will retry on the
        // next login.
        syncedFor.current = false;
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [isAuthenticated, isReady, hydrated, refetchServer]);

  const lines: CartLine[] = useMemo(() => {
    if (isAuthenticated) {
      return (serverQuery.data ?? []).map((item) => {
        const snapKey = lineKey(
          item.product_id,
          item.variant_id ?? null,
          item.print_method ?? null,
          item.custom_text ?? null
        );
        return mapServerItem(item, snapshots[snapKey]);
      });
    }
    return localLines;
  }, [isAuthenticated, serverQuery.data, localLines, snapshots]);

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      const quantity = Math.max(1, input.quantity ?? 1);
      const variant = input.variant ?? null;
      const print_method = input.print_method ?? null;
      const custom_text = input.custom_text ?? null;
      const key = lineKey(input.product.id, variant?.id ?? null, print_method, custom_text);

      const snapshot: CartLine = {
        key,
        product_id: input.product.id,
        variant_id: variant?.id ?? null,
        quantity,
        print_method,
        custom_text,
        name: input.product.name,
        slug: input.product.slug,
        image: input.image ?? productImage(input.product),
        price: unitPrice(input.product, variant),
        variant_label: variantLabel(variant),
        design_uploads: input.design_uploads,
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
        const existing = (serverQuery.data ?? []).find(
          (item) =>
            lineKey(
              item.product_id,
              item.variant_id ?? null,
              item.print_method ?? null,
              item.custom_text ?? null
            ) === key
        );
        if (existing) {
          await cartService.update(existing.id, {
            quantity: existing.quantity + quantity,
          });
        } else {
          await cartService.create({
            product_id: input.product.id,
            variant_id: variant?.id ?? null,
            quantity,
            print_method,
            custom_text,
            design_uploads: input.design_uploads,
          });
        }
        await refetchServer();
        return;
      }

      const current = readLocalCart();
      const existing = current.find((line) => line.key === key);
      const next = existing
        ? current.map((line) =>
            line.key === key
              ? { ...line, quantity: line.quantity + quantity }
              : line
          )
        : [...current, snapshot];
      persistLocal(next);
    },
    [isAuthenticated, serverQuery.data, refetchServer, persistLocal]
  );

  const updateQuantity = useCallback(
    async (key: string, quantity: number) => {
      const line = lines.find((l) => l.key === key);
      if (!line) return;
      if (quantity < 1) return;

      if (line.serverId) {
        await cartService.update(line.serverId, { quantity });
        await refetchServer();
        return;
      }
      persistLocal(
        readLocalCart().map((l) => (l.key === key ? { ...l, quantity } : l))
      );
    },
    [lines, refetchServer, persistLocal]
  );

  const removeItem = useCallback(
    async (key: string) => {
      const line = lines.find((l) => l.key === key);
      if (!line) return;

      if (line.serverId) {
        await cartService.remove(line.serverId);
        await refetchServer();
        return;
      }
      persistLocal(readLocalCart().filter((l) => l.key !== key));
    },
    [lines, refetchServer, persistLocal]
  );

  const clearCart = useCallback(async () => {
    const serverLines = lines.filter((l) => l.serverId);
    for (const line of serverLines) {
      try {
        await cartService.remove(line.serverId!);
      } catch {
        // Clearing runs after the order is already placed, so a delete that
        // fails server-side must never surface as a checkout error. The next
        // cart fetch will show whatever the server still holds.
      }
    }
    clearLocalCart();
    setLocalLines([]);
    setCoupon(null);
    try {
      window.localStorage.removeItem(COUPON_KEY);
    } catch {
      // ignore
    }
    if (serverLines.length) await refetchServer();
  }, [lines, refetchServer]);

  const subtotalValue = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      const result = await couponService.validate(trimmed, subtotalValue, user?.id);
      const applied = { code: trimmed, discount_amount: result.discount_amount };
      setCoupon(applied);
      try {
        window.localStorage.setItem(COUPON_KEY, JSON.stringify(applied));
      } catch {
        // ignore
      }
    },
    [subtotalValue, user?.id]
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    try {
      window.localStorage.removeItem(COUPON_KEY);
    } catch {
      // ignore
    }
  }, []);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );
  const subtotal = subtotalValue;
  // Never let a stale coupon discount more than the cart is worth.
  const discount = Math.min(coupon?.discount_amount ?? 0, subtotal);
  const total = Math.max(0, subtotal - discount);

  const value: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    isLoading: !hydrated || (isAuthenticated && serverQuery.isLoading),
    isSyncing,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    discount,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
