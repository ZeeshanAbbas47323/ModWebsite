import type { DesignUploadInput, PrintMethod } from "@/services/cart.service";


export const BUILDER_ORIGIN = (
  process.env.NEXT_PUBLIC_GANG_SHEET_BUILDER_URL ?? "https://builder.modfirst.com"
).replace(/\/$/, "");


export const DEFAULT_BUILDER_PRODUCT_SLUG =
  process.env.NEXT_PUBLIC_GANG_SHEET_PRODUCT_SLUG ?? "build-your-own-gangsheet";


const EXPLICIT_MAP: Record<string, string> = Object.fromEntries(
  (
    process.env.NEXT_PUBLIC_GANG_SHEET_PRODUCT_MAP ??
    "build-your-dtf-gang-sheets-online:build-your-own-gangsheet"
  )
    .split(",")
    .map((pair) => pair.split(":").map((part) => part.trim()))
    .filter((pair) => pair.length === 2 && pair[0] && pair[1])
);


export function gangSheetPrintMethod(item: GangSheetCartItem): PrintMethod {
  const slug = String(
    (item.priceBreakdown as { productSlug?: string } | undefined)?.productSlug ?? ""
  ).toLowerCase();
  return slug.includes("sublimation") ? "sublimation" : "dtf";
}


export function gangSheetDesignUploads(item: GangSheetCartItem): DesignUploadInput[] {
  const print_method = gangSheetPrintMethod(item);
  return item.artifacts.map((artifact) => ({
    file_url: artifact.url,
    file_name: artifact.name,

    ...(item.editUrl ? { edit_url: item.editUrl } : {}),
    print_method,
  }));
}


export interface GangSheetArtifact {
  name: string;
  format: string;
  sizeBytes: number;

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


export interface BuilderProduct {
  id: string;
  slug: string;
  name: string;
  widthIn: number;
  dpi: number;
  currency: string;
}


function nameKey(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}


export function matchBuilderProduct(
  product: { slug?: string | null; name?: string | null } | null | undefined,
  builderProducts: BuilderProduct[] | undefined
): BuilderProduct | undefined {
  if (!product || !builderProducts?.length) return undefined;


  const mapped = product.slug ? EXPLICIT_MAP[product.slug] : undefined;
  if (mapped) {
    const byMap = builderProducts.find((candidate) => candidate.slug === mapped);
    if (byMap) return byMap;
  }

  const bySlug = builderProducts.find((candidate) => candidate.slug === product.slug);
  if (bySlug) return bySlug;

  const key = nameKey(product.name);
  if (!key) return undefined;
  return builderProducts.find((candidate) => nameKey(candidate.name) === key);
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
