"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeHero } from "@/lib/map-home-hero";
import { resolveImageUrl } from "@/lib/image-url";

const badgeContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.8,
      staggerChildren: 0.15,
    },
  },
};

const badgeItem: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 250, damping: 15 },
  },
};

export function Hero() {
  const { data: section, isLoading } = useHomeSection("home_hero");
  const hero = mapHomeHero(section);

  const primary = hero?.composition.find((c) => c.role === "primary_image");
  const secondary = hero?.composition.find((c) => c.role === "secondary_image");
  const stamp = hero?.composition.find((c) => c.role === "stamp");

  const avatars = (hero?.feedback.avatars ?? []).slice(
    0,
    Math.min(hero?.feedback.avatarsCount || 4, 8)
  );
  const rating = hero?.feedback.rating ?? 0;
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

  const [collageError, setCollageError] = useState(false);
  const COLLAGE_FALLBACK = "/images/banners-compositions/shirt.png";
  const desktopCollage = collageError ? COLLAGE_FALLBACK : (hero?.collageImageUrl || "");
  const mobileCollage = collageError ? COLLAGE_FALLBACK : (hero?.collageMobileImageUrl || desktopCollage);

  return (
    <section
      className="relative min-h-[calc(100svh-5.05rem)] w-full overflow-hidden"
      style={{ backgroundColor: hero?.backgroundColor || "#030303" }}
    >
      {hero?.gradient ? (
        <div className="absolute inset-0" style={{ background: hero.gradient }} />
      ) : (
        <div className="absolute inset-0 bg-linear-to-b from-primary via-[#262e01] to-black" />
      )}

      {hero?.backgroundImage ? (
        <div className="absolute inset-0">
          <Image
            src={hero.backgroundImage}
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
        </div>
      ) : null}

      {hero?.overlayImage ? (
        <div
          className="absolute inset-0 bg-no-repeat bg-contain bg-right"
          style={{
            backgroundImage: `url('${hero.overlayImage}')`,
            opacity: hero.overlayOpacity ?? 0.05,
          }}
        />
      ) : null}

      <div className="container relative z-10 flex min-h-[calc(100svh-5.05rem)] flex-1 flex-col lg:flex-row items-center gap-8 py-12 lg:py-20">
        <div className="flex-1 w-full text-white">
          {isLoading ? (
            <div className="animate-pulse space-y-6 max-w-2xl">
              <div className="h-14 bg-white/15 rounded-lg w-4/5" />
              <div className="h-14 bg-white/15 rounded-lg w-3/5" />
              <div className="h-20 bg-white/10 rounded-lg w-full" />
              <div className="flex gap-8">
                <div className="h-16 w-24 bg-white/10 rounded-lg" />
                <div className="h-16 w-24 bg-white/10 rounded-lg" />
                <div className="h-16 w-24 bg-white/10 rounded-lg" />
              </div>
              <div className="h-12 w-40 bg-white/15 rounded-xl" />
            </div>
          ) : (
            <>
              {hero?.badge ? (
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 text-sm border border-white/15"
                >
                  {hero.badge}
                </motion.span>
              ) : null}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
              >
                {hero?.title}
              </motion.h1>

              {hero?.subtitle ? (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="text-xl text-white/90 font-medium mb-4"
                >
                  {hero.subtitle}
                </motion.p>
              ) : null}

              {hero?.description ? (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-lg text-white max-w-2xl mb-10 leading-relaxed font-normal"
                >
                  {hero.description}
                </motion.p>
              ) : null}

              {hero?.stats?.length ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex flex-wrap gap-8 md:gap-12 mb-10"
                >
                  {hero.stats.map((stat) => (
                    <div key={`${stat.label}-${stat.value}`}>
                      <div className="text-3xl md:text-5xl font-extrabold mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base text-white">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : null}

              {hero?.buttonText ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Button variant="default" size="xl" asChild>
                    <Link href={hero.buttonUrl || "/products"}>
                      {hero.buttonText}
                    </Link>
                  </Button>
                </motion.div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex-1 w-full mt-16 lg:mt-0 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[600px] h-[450px] md:h-[500px]">
            {desktopCollage ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  className={`relative w-full h-full ${mobileCollage && mobileCollage !== desktopCollage ? "hidden md:block" : ""}`}
                >
                  <Image
                    src={desktopCollage}
                    alt={hero?.title || "Hero"}
                    fill
                    priority
                    className="object-contain object-center"
                    sizes="(max-width: 1024px) 100vw, 600px"
                    onError={() => setCollageError(true)}
                  />
                </motion.div>
                {mobileCollage && mobileCollage !== desktopCollage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                    className="relative w-full h-full md:hidden"
                  >
                    <Image
                      src={mobileCollage}
                      alt={hero?.title || "Hero"}
                      fill
                      priority
                      className="object-contain object-center"
                      sizes="100vw"
                      onError={() => setCollageError(true)}
                    />
                  </motion.div>
                ) : null}
              </>
            ) : (
              <>
                {primary ? (
                  <div className="absolute left-0 bottom-0 w-[67%] md:w-[60%] h-[80%] rounded-4xl overflow-hidden shadow-2xl z-10">
                    <motion.div
                      initial={{ opacity: 0, x: -40, y: 40 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={primary.src}
                        alt={primary.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 60vw, 360px"
                      />
                    </motion.div>
                  </div>
                ) : null}

                {secondary ? (
                  <div className="absolute right-0 top-0 w-[55%] md:w-[46%] h-[55%] md:h-[65%] rounded-4xl overflow-hidden shadow-2xl z-20">
                    <motion.div
                      initial={{ opacity: 0, x: 40, y: -40 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={secondary.src}
                        alt={secondary.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 280px"
                      />
                    </motion.div>
                  </div>
                ) : null}

                {stamp ? (
                  <div className="absolute top-[15%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 z-30 drop-shadow-2xl">
                    <motion.div
                      initial={{ opacity: 0, scale: 0, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={stamp.src}
                        alt={stamp.alt}
                        fill
                        className="object-contain animate-[spin_12s_linear_infinite]"
                      />
                    </motion.div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {hero?.feedback.text ? (
          <motion.div
            variants={badgeContainer}
            initial="hidden"
            animate="show"
            className="hidden lg:flex absolute bottom-7 right-0 flex-col gap-3 z-30"
          >
            <div className="flex items-center justify-center px-4">
              <div className="flex flex-row justify-center items-center gap-6">
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
                  {avatars.map((avatar, index) => (
                    <motion.div
                      key={`${avatar.image_url}-${index}`}
                      variants={badgeItem}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={resolveImageUrl(avatar.image_url)} alt="avatar" />
                        <AvatarFallback>{avatar.fallback || "U"}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <motion.div
                variants={badgeItem}
                className="text-white font-medium text-center text-lg mb-1"
              >
                {hero.feedback.text}
              </motion.div>
              <motion.div
                variants={badgeItem}
                className="flex justify-center items-center gap-1 text-sm w-full"
              >
                <div className="flex gap-1">
                  {Array.from({ length: filledStars }).map((_, i) => (
                    <Image
                      key={i}
                      src="/images/icons/star.svg"
                      alt="star"
                      width={15}
                      height={15}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-base">
                  / {rating.toFixed(1)}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
