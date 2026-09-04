import Image from "next/image";
import type { ShowcaseImage } from "@/lib/home-showcase-images";

/**
 * The image half of the two home showcase sections.
 *
 * Two columns, with landscape art taking the full width. An odd tile at the
 * end is widened too, so the grid never finishes on a lone square.
 */
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
              src={image.src}
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
