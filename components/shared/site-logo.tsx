"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { resolveImageUrl } from "@/lib/image-url";

const LOCAL_LOGO = "/images/branding/logo-dark.svg";

interface SiteLogoProps extends Omit<ImageProps, "src" | "alt"> {
  /** "white" for a dark background — falls back to the same dark-on-transparent mark either way. */
  variant?: "black" | "white";
}

/**
 * The site logo, falling back to the bundled SVG whenever the CMS URL 404s —
 * `logo_url` currently points at a dead domain (`storage.modfirstapparel.com`)
 * with no usable replacement uploaded, so every `<Image src={resolveImageUrl(...)}>`
 * copy of this was rendering broken sitewide (header, footer, sidebar, auth
 * screens). `onError` catches that at render time regardless of what's in the
 * database, rather than needing the CMS data fixed first.
 */
export function SiteLogo({ variant = "black", ...imgProps }: SiteLogoProps) {
  const { data: settings } = useWebsiteSettings();
  const [failed, setFailed] = useState(false);

  const cmsUrl =
    variant === "white"
      ? settings?.logo_white_url || settings?.logo_url
      : settings?.logo_black_url || settings?.logo_url;

  const src = !failed && cmsUrl ? resolveImageUrl(cmsUrl) : LOCAL_LOGO;
  const isRemote = src.startsWith("http");

  return (
    <Image
      src={src}
      alt={settings?.site_name ?? "ModFirst"}
      unoptimized={isRemote}
      onError={() => setFailed(true)}
      {...imgProps}
    />
  );
}
