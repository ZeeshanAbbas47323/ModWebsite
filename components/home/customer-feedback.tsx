"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeCustomerFeedback } from "@/lib/map-home-customer-feedback";

export function CustomerFeedback() {
  const { data: section, isLoading } = useHomeSection("home_customer_feedback");
  const feedback = mapHomeCustomerFeedback(section);

  if (isLoading) {
    return (
      <section className="container pt-10 md:pt-12 lg:pt-16 animate-pulse">
        <div className="h-12 w-80 bg-gray-200 rounded-lg mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </section>
    );
  }

  if (!feedback || (!feedback.title && feedback.reviews.length === 0)) {
    return null;
  }

  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-6">
        {feedback.title ? (
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ color: feedback.titleColor }}
          >
            {feedback.title}
          </h2>
        ) : null}

        {feedback.platformRatings.length > 0 ? (
          <div className="flex flex-wrap items-center gap-4 lg:gap-8">
            {feedback.platformRatings.map((platform) => (
              <div
                key={platform.platform || platform.label}
                className="flex items-center gap-2"
              >
                {platform.iconUrl ? (
                  <Image
                    src={platform.iconUrl}
                    alt={platform.platform || "Rating"}
                    width={24}
                    height={24}
                    className="w-7 h-7"
                  />
                ) : null}
                <div className="flex flex-col">
                  <div className="flex gap-1">
                    {Array.from({ length: Math.max(0, platform.stars) }).map(
                      (_, i) => (
                        <Image
                          src="/images/icons/star.svg"
                          alt="Star"
                          key={i}
                          width={16}
                          height={16}
                        />
                      )
                    )}
                  </div>
                  {platform.label ? (
                    <span className="text-xs text-gray-500 mt-1">
                      {platform.label}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {feedback.reviews.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {feedback.reviews.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3"
              >
                <div
                  className="rounded-2xl p-6 md:p-8 h-full flex flex-col"
                  style={{ backgroundColor: feedback.cardBackgroundColor }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {item.avatar ? (
                      <div className="w-14 h-14 relative rounded-full overflow-hidden shrink-0">
                        <Image
                          src={item.avatar}
                          alt={item.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div>
                      {item.name ? (
                        <h4 className="font-bold text-lg leading-tight">
                          {item.name}
                        </h4>
                      ) : null}
                      {item.rating > 0 ? (
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Image
                              src="/images/icons/star.svg"
                              alt="Star"
                              key={i}
                              width={16}
                              height={16}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {item.feedback ? (
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                      {item.feedback}
                    </p>
                  ) : null}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 w-10 h-10 bg-white shadow-md">
            <svg
              width="10"
              height="19"
              viewBox="0 0 10 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rotate-180"
            >
              <path
                d="M0 1.48585L1.48725 -7.62939e-06L9.58796 8.09789C9.71853 8.22765 9.82216 8.38195 9.89288 8.55191C9.96359 8.72187 10 8.90414 10 9.08823C10 9.27231 9.96359 9.45458 9.89288 9.62454C9.82216 9.7945 9.71853 9.9488 9.58796 10.0786L1.48725 18.1807L0.0014019 16.6948L7.60448 9.09033L0 1.48585Z"
                fill="black"
              />
            </svg>
          </CarouselPrevious>
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6 w-10 h-10 bg-white shadow-md">
            <svg
              width="10"
              height="19"
              viewBox="0 0 10 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 1.48585L1.48725 -7.62939e-06L9.58796 8.09789C9.71853 8.22765 9.82216 8.38195 9.89288 8.55191C9.96359 8.72187 10 8.90414 10 9.08823C10 9.27231 9.96359 9.45458 9.89288 9.62454C9.82216 9.7945 9.71853 9.9488 9.58796 10.0786L1.48725 18.1807L0.0014019 16.6948L7.60448 9.09033L0 1.48585Z"
                fill="black"
              />
            </svg>
          </CarouselNext>
        </Carousel>
      ) : null}
    </section>
  );
}
