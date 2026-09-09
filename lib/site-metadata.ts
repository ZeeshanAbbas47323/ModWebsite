import type { Metadata } from "next";

import { isDeadDomain, resolveImageUrl } from "@/lib/image-url";
import { API_BASE, API_HEADERS } from "@/lib/upstream";
import type { WebsiteSettings } from "@/services/website-settings.service";

const FALLBACK = {
  name: "ModFirst",
  title: "ModFirst — Custom Apparel & Printing",
  description:
    "Custom apparel and printing — DTF transfers, embroidery, UV DTF stickers, t-shirts, hoodies and banners.",
};

export async function getSiteSettings(): Promise<WebsiteSettings | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/website-settings/current`, {
      headers: API_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.payload ?? data?.data ?? null) as WebsiteSettings | null;
  } catch {
    return null;
  }
}

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

function assetUrl(url: string | null | undefined): string | null {
  if (!url || isDeadDomain(url)) return null;
  const resolved = resolveImageUrl(url);
  if (!resolved) return null;
  return resolved.startsWith("http") ? resolved : `${siteOrigin()}${resolved}`;
}

async function assetExists(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}

async function usableAsset(url: string | null | undefined): Promise<string | null> {
  return assetExists(assetUrl(url));
}

export async function buildSiteMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();

  const name = s?.site_name?.trim() || FALLBACK.name;
  const title = s?.meta_title?.trim() || s?.site_tagline?.trim() || FALLBACK.title;
  const description =
    s?.meta_description?.trim() || s?.site_description?.trim() || FALLBACK.description;
  const keywords = s?.meta_keywords
    ? s.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  const [ogFromCms, ogFromLogo, favicon] = await Promise.all([
    usableAsset(s?.og_image_url),
    usableAsset(s?.logo_url),
    usableAsset(s?.favicon_url),
  ]);
  const ogImage = ogFromCms ?? ogFromLogo;
  const origin = siteOrigin();

  return {
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    title: { default: title, template: `%s | ${name}` },
    description,
    ...(keywords?.length ? { keywords } : {}),
    applicationName: name,
    ...(favicon ? { icons: { icon: favicon, shortcut: favicon, apple: favicon } } : {}),
    openGraph: {
      type: "website",
      siteName: name,
      title,
      description,
      ...(origin ? { url: origin } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: { index: true, follow: true },
  };
}
