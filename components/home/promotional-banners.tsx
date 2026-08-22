"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useHomeSection } from "@/hooks/use-home-section";
import {
  mapHomePromoBanners,
  type PromoCardViewModel,
} from "@/lib/map-home-promo-banners";

const cardContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const imageItem: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: 30 },
  show: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 },
  },
};

const bottomBannerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.2, ease: "easeOut" },
  },
};

function LeftPromoCard({ card }: { card: PromoCardViewModel }) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="rounded-[24px] p-8 md:p-10 relative overflow-hidden min-h-[340px] flex flex-col justify-center"
      style={{ backgroundColor: card.backgroundColor }}
    >
      <div className="z-10 relative flex flex-col justify-between flex-1 gap-6">
        <motion.div variants={textItem}>
          {card.eyebrow ? (
            <p
              className="text-xl mb-2"
              style={{ color: card.textColor }}
            >
              {card.eyebrow}
            </p>
          ) : null}
          {card.highlight ? (
            <h2
              className="text-5xl font-extrabold tracking-tight"
              style={{ color: card.accentColor }}
            >
              {card.highlight}
            </h2>
          ) : null}
        </motion.div>

        <motion.div variants={textItem}>
          {card.title ? (
            <h3
              className="text-3xl font-bold mb-2"
              style={{ color: card.textColor }}
            >
              {card.title}
            </h3>
          ) : null}
          {card.description ? (
            <p
              className="text-lg md:leading-relaxed"
              style={{ color: card.descriptionColor }}
            >
              {card.description}
            </p>
          ) : null}
        </motion.div>
      </div>

      {card.imageUrl ? (
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
          <motion.div variants={imageItem}>
            <Image
              src={card.imageUrl}
              alt={card.alt}
              width={350}
              height={350}
              className="object-contain w-[200px] sm:w-full lg:w-[250px] xl:w-[300px] 2xl:w-[350px]"
              priority
            />
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}

function RightPromoCard({ card }: { card: PromoCardViewModel }) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="rounded-[24px] p-8 md:p-10 relative overflow-hidden min-h-[340px] flex flex-col justify-center"
      style={{ backgroundColor: card.backgroundColor }}
    >
      <div className="z-10 relative flex flex-col justify-between flex-1 gap-6">
        <motion.div variants={textItem}>
          {card.title ? (
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: card.textColor }}
            >
              {card.title}
            </h2>
          ) : null}
          {card.description ? (
            <p
              className="text-lg md:leading-relaxed"
              style={{ color: card.descriptionColor }}
            >
              {card.description}
            </p>
          ) : null}
        </motion.div>

        <motion.div variants={textItem}>
          {card.priceLabel ? (
            <p className="text-xl mb-2" style={{ color: card.textColor }}>
              {card.priceLabel}
            </p>
          ) : null}
          {card.priceValue ? (
            <p
              className="text-4xl md:text-5xl font-bold tracking-tight"
              style={{ color: card.accentColor || card.textColor }}
            >
              {card.priceValue}
            </p>
          ) : null}
        </motion.div>
      </div>

      {card.imageUrl ? (
        <div className="absolute right-0 top-20 bottom-0 flex items-center justify-end pointer-events-none">
          <motion.div variants={imageItem}>
            <Image
              src={card.imageUrl}
              alt={card.alt}
              width={550}
              height={550}
              className="object-contain lg:w-[350px] xl:w-[430px] 2xl:w-[550px]"
              priority
            />
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}

export function PromotionalBanners() {
  const { data: section, isLoading } = useHomeSection("home_promo_banners");
  const promo = mapHomePromoBanners(section);

  const leftCard =
    promo?.cards.find((c) => c.role === "left_card") ?? promo?.cards[0];
  const rightCard =
    promo?.cards.find((c) => c.role === "right_card") ?? promo?.cards[1];

  if (isLoading) {
    return (
      <section className="container w-full pt-10 md:pt-12 lg:pt-16 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="min-h-[340px] rounded-[24px] bg-gray-100 animate-pulse" />
          <div className="min-h-[340px] rounded-[24px] bg-gray-100 animate-pulse" />
        </div>
        <div className="h-16 rounded-[20px] bg-gray-100 animate-pulse" />
      </section>
    );
  }

  if (!promo || (!leftCard && !rightCard && !promo.bottomBanner)) {
    return null;
  }

  return (
    <section className="container w-full pt-10 md:pt-12 lg:pt-16 flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leftCard ? <LeftPromoCard card={leftCard} /> : null}
        {rightCard ? <RightPromoCard card={rightCard} /> : null}
      </div>

      {promo.bottomBanner ? (
        <motion.div
          variants={bottomBannerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="w-full border-[1.5px] border-dashed rounded-[20px] py-6 px-4 md:px-8 text-center"
          style={{
            backgroundColor: promo.bottomBanner.backgroundColor,
            borderColor: promo.bottomBanner.borderColor,
          }}
        >
          <p
            className="text-lg md:text-xl font-semibold tracking-wide"
            style={{ color: promo.bottomBanner.textColor }}
          >
            {promo.bottomBanner.text}
          </p>
        </motion.div>
      ) : null}
    </section>
  );
}
