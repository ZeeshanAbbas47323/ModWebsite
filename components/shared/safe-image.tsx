"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

const PLACEHOLDER = "/images/placeholder-image.svg";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  /** Extra classes applied only while showing the placeholder (e.g. to shrink/center the icon). */
  placeholderClassName?: string;
}

/**
 * Drop-in replacement for next/image that swaps to a neutral "image not
 * available" icon on load failure — a stored image_url that 404s (dead CDN
 * link, deleted file, bad scrape) would otherwise render as the browser's
 * own broken-image glyph, which reads as the site being broken rather than
 * just one missing photo.
 */
export function SafeImage({ src, alt, className, placeholderClassName, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const isRemote = typeof src === "string" && src.startsWith("http");

  if (failed) {
    return (
      <Image
        src={PLACEHOLDER}
        alt={alt}
        className={[className, "opacity-60", placeholderClassName].filter(Boolean).join(" ")}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...(isRemote ? { unoptimized: true } : {})}
      {...rest}
    />
  );
}
