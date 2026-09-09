"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { resolveImageUrl } from "@/lib/image-url";

const LOCAL_LOGO = "/images/branding/logo-dark.svg";

interface SiteLogoProps extends Omit<ImageProps, "src" | "alt"> {
  variant?: "black" | "white";
}

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
