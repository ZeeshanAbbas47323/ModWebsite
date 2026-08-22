"use client";

import Image from "next/image";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeFastProduction } from "@/lib/map-home-fast-production";

export const FastProduction = () => {
  const { data: section, isLoading } = useHomeSection("home_fast_production");
  const data = mapHomeFastProduction(section);

  if (isLoading) {
    return (
      <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
        <div className="container flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 animate-pulse">
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
            <div className="col-span-2 h-40 md:h-64 rounded-[24px] bg-gray-100" />
            <div className="h-40 md:h-64 rounded-[24px] bg-gray-100" />
            <div className="h-40 md:h-64 rounded-[24px] bg-gray-100" />
          </div>
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="h-12 w-80 bg-gray-200 rounded-lg" />
            <div className="h-24 w-full max-w-lg bg-gray-100 rounded-lg" />
            <div className="h-6 w-64 bg-gray-100 rounded" />
            <div className="h-6 w-56 bg-gray-100 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const wideImage =
    data.images.find((img) => img.role === "image_wide") ?? data.images[0];
  const leftImage =
    data.images.find((img) => img.role === "image_left") ?? data.images[1];
  const rightImage =
    data.images.find((img) => img.role === "image_right") ?? data.images[2];

  return (
    <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
      {data.backgroundImage ? (
        <div className="absolute right-[-5%] md:right-0 top-1/2 -translate-y-1/2 -z-10 w-[250px] md:w-[500px] h-[120%] opacity-90 pointer-events-none">
          <Image
            src={data.backgroundImage}
            alt="Background Element"
            fill
            className="object-contain object-right"
          />
        </div>
      ) : null}

      <div className="container flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
          {wideImage ? (
            <div className="col-span-2 relative h-40 md:h-64 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md">
              <Image
                src={wideImage.imageUrl}
                alt={wideImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ) : null}

          {leftImage ? (
            <div className="relative h-40 md:h-64 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md">
              <Image
                src={leftImage.imageUrl}
                alt={leftImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ) : null}

          {rightImage ? (
            <div className="relative h-40 md:h-64 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md">
              <Image
                src={rightImage.imageUrl}
                alt={rightImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ) : null}
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {data.title ? (
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
              style={{ color: data.titleColor }}
            >
              {data.title}
            </h2>
          ) : null}

          {data.description ? (
            <p
              className="text-base md:text-lg leading-relaxed max-w-lg"
              style={{ color: data.descriptionColor }}
            >
              {data.description}
            </p>
          ) : null}

          {data.features.length > 0 ? (
            <ul className="flex flex-col gap-3 mt-2">
              {data.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 font-bold text-base md:text-lg"
                  style={{ color: data.featureTextColor }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: data.bulletColor }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
};
