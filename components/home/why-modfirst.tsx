"use client";

import Image from "next/image";
import { ShowcaseMosaic } from "@/components/home/showcase-mosaic";
import { WHY_MODFIRST_IMAGES } from "@/lib/home-showcase-images";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeWhyModfirst } from "@/lib/map-home-why-modfirst";

export const WhyModfirst = () => {
  const { data: section, isLoading } = useHomeSection("home_why_modfirst");
  const why = mapHomeWhyModfirst(section);

  if (isLoading) {
    return (
      <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
        <div className="container flex flex-col lg:flex-row items-center gap-12 lg:gap-20 animate-pulse">
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="h-12 w-72 bg-gray-200 rounded-lg" />
            <div className="h-24 w-full max-w-lg bg-gray-100 rounded-lg" />
            <div className="h-6 w-64 bg-gray-100 rounded" />
            <div className="h-6 w-56 bg-gray-100 rounded" />
            <div className="h-6 w-60 bg-gray-100 rounded" />
          </div>
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
            <div className="col-span-2 h-40 md:h-64 rounded-[24px] bg-gray-100" />
            <div className="h-40 md:h-64 rounded-[24px] bg-gray-100" />
            <div className="h-40 md:h-64 rounded-[24px] bg-gray-100" />
          </div>
        </div>
      </section>
    );
  }

  if (!why) return null;

  return (
    <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
      {why.backgroundImage ? (
        <div className="absolute left-[-5%] md:left-0 top-1/2 -translate-y-1/2 -z-10 w-[250px] md:w-[450px] h-[120%] opacity-90 pointer-events-none">
          <Image
            src={why.backgroundImage}
            alt="Background Element"
            fill
            className="object-contain object-left"
          />
        </div>
      ) : null}

      <div className="container flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {why.title ? (
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ color: why.titleColor }}
            >
              {why.title}
            </h2>
          ) : null}

          {why.description ? (
            <p
              className="text-base md:text-lg leading-relaxed max-w-lg"
              style={{ color: why.descriptionColor }}
            >
              {why.description}
            </p>
          ) : null}

          {why.features.length > 0 ? (
            <ul className="flex flex-col gap-3 mt-2">
              {why.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 font-bold text-base md:text-lg"
                  style={{ color: why.featureTextColor }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: why.bulletColor }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="w-full lg:w-1/2">
            <ShowcaseMosaic images={WHY_MODFIRST_IMAGES} />
          </div>
      </div>
    </section>
  );
};
