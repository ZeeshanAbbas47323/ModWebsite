"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

const PLACEHOLDER = "/images/placeholder-image.svg";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  placeholderClassName?: string;
}

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
