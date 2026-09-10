import Image from "next/image";
import type { ShowcaseImage } from "@/lib/home-showcase-images";
import { resolveImageUrl } from "@/lib/image-url";
import type { WhyModfirstImage } from "@/lib/map-home-why-modfirst";

/**
 * Adapts a section item from the API to what the mosaic draws. Items mark a
 * full-width tile through `span`, which is stored as a grid class such as
 * "col-span-2".
 */
export function toShowcaseImages(items: WhyModfirstImage[]): ShowcaseImage[] {
  return items.map((item) => ({
    src: item.imageUrl,
    alt: item.alt,
    wide: /col-span-2|full|wide/i.test(item.span || item.role || ""),
  }));
}

export function ShowcaseMosaic({ images }: { images: ShowcaseImage[] }) {
  const squares = images.filter((image) => !image.wide);
  const lastSquare = squares.length % 2 === 1 ? squares[squares.length - 1] : null;

  return (
    <div className="grid w-full grid-cols-2 gap-4 md:gap-5">
      {images.map((image) => {
        const full = image.wide || image === lastSquare;
        return (
          <div
            key={image.src}
            className={`relative overflow-hidden rounded-[20px] shadow-md md:rounded-[24px] ${
              full ? "col-span-2 h-40 md:h-52" : "h-36 md:h-44"
            }`}
          >
            <Image
              src={resolveImageUrl(image.src)}
              alt={image.alt}
              fill
              className="object-cover"
              sizes={full ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
            />
          </div>
        );
      })}
    </div>
  );
}
