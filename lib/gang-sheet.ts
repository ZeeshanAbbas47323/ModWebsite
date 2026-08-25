import type { DesignUploadInput, PrintMethod } from "@/services/cart.service";

/** Where the builder is hosted. Overridable per environment. */
export const BUILDER_ORIGIN = (
  process.env.NEXT_PUBLIC_GANG_SHEET_BUILDER_URL ?? "https://builder.modfirst.com"
).replace(/\/$/, "");

/**
 * Products in this category open the gang sheet builder instead of the normal
 * buy box.
 */
export const GANG_SHEET_CATEGORY_ID = Number(
  process.env.NEXT_PUBLIC_GANG_SHEET_CATEGORY_ID ?? 1
);

/** Builder-side product a session opens on when the storefront has no mapping. */
export const DEFAULT_BUILDER_PRODUCT_SLUG =
  process.env.NEXT_PUBLIC_GANG_SHEET_PRODUCT_SLUG ?? "build-your-own-gangsheet";

export function isGangSheetProduct(categoryId: number | null | undefined) {
  return categoryId === GANG_SHEET_CATEGORY_ID;
}

/**
 * Which print process a finished sheet belongs to. The builder does not send
 * this directly, so it is read off the product it was built on.
 */
export function gangSheetPrintMethod(item: GangSheetCartItem): PrintMethod {
  const slug = String(
    (item.priceBreakdown as { productSlug?: string } | undefined)?.productSlug ?? ""
  ).toLowerCase();
  return slug.includes("sublimation") ? "sublimation" : "dtf";
}

/** Map a finished sheet onto the cart's design-upload shape. */
export function gangSheetDesignUploads(item: GangSheetCartItem): DesignUploadInput[] {
  const print_method = gangSheetPrintMethod(item);
  return item.artifacts.map((artifact) => ({
    file_url: artifact.url,
    file_name: artifact.name,
    // Lets a shopper (or the team) reopen the exact sheet later.
    ...(item.editUrl ? { edit_url: item.editUrl } : {}),
    print_method,
  }));
}

/** One rendered print file produced by the builder. */
export interface GangSheetArtifact {
  name: string;
  format: string;
  sizeBytes: number;
  /** Pre-signed S3 URL — expires, so persist it server-side promptly. */
  url: string;
}

export interface GangSheetMetrics {
  dpi: number;
  heights: number[];
  widthIn: number;
  warnings: string[];
  copyCount: number;
  imageCount: number;
  sheetCount: number;
  materialSqFt: number;
  printLengthIn: number;
  printLengthLabel: string;
}

/** Payload the builder hands back when the shopper finishes a sheet. */
export interface GangSheetCartItem {
  orderId: string;
  sessionId: string;
  sku: string;
  name: string;
  quantity: number;
  currency: string;
  unitPriceCents: number;
  totalPriceCents: number;
  unitPrice: number;
  totalPrice: number;
  priceBreakdown?: Record<string, unknown>;
  metrics: GangSheetMetrics;
  externalCustomerId: string | null;
  externalCartId: string | null;
  artifacts: GangSheetArtifact[];
  createdAt: string;
  revision: number;
  editUrl?: string;
  verification?: {
    algorithm: string;
    issuedAt: number;
    signature: string;
  };
}

export interface GangSheetSession {
  sessionId: string;
  token: string;
}

export interface GangSheetMountOptions {
  target: string | Element;
  createSession: () => Promise<GangSheetSession>;
  onAddToCart: (item: GangSheetCartItem) => void | Promise<void>;
  onReady?: (sessionId: string) => void;
  onChange?: (state: {
    sessionId: string;
    revision: number;
    sheetCount: number;
    designCount: number;
  }) => void;
  onError?: (message: string, code?: string) => void;
  onCancel?: () => void;
  height?: string;
  redirectUrl?: string;
}

export interface GangSheetInstance {
  iframe: HTMLIFrameElement;
  sessionId: string | null;
  destroy: () => void;
}

declare global {
  interface Window {
    GangSheetBuilder?: {
      mount: (options: GangSheetMountOptions) => GangSheetInstance;
      origin: string;
      protocolVersion: number;
    };
  }
}

const EMBED_SRC = `${BUILDER_ORIGIN}/embed/gangsheet-embed.js`;
let loader: Promise<void> | null = null;

/** Inject the embed loader once, and resolve when `GangSheetBuilder` exists. */
export function loadGangSheetEmbed(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.GangSheetBuilder) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${EMBED_SRC}"]`
    );
    const script = existing ?? document.createElement("script");

    const done = () =>
      window.GangSheetBuilder
        ? resolve()
        : reject(new Error("Gang sheet builder failed to initialise."));

    script.addEventListener("load", done);
    script.addEventListener("error", () => {
      loader = null;
      reject(new Error("Could not load the gang sheet builder."));
    });

    if (!existing) {
      script.src = EMBED_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return loader;
}
