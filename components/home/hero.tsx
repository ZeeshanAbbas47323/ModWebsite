"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HERO_SLIDES, SLIDE_DURATION } from "@/lib/home-hero-slides";

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** Which way the last move went, so slides enter from the right side. */
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  const slide = HERO_SLIDES[index];
  const count = HERO_SLIDES.length;

  const goTo = useCallback(
    (next: number, from = 1) => {
      setDirection(from);
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // A hidden tab freezes requestAnimationFrame, so transitions cannot finish.
  // Advancing anyway would stack up slides that never leave.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Auto-advance, held while the shopper is reading or interacting.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (paused || hidden || reduceMotion || count < 2) return;
    timer.current = setTimeout(next, SLIDE_DURATION);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, paused, hidden, reduceMotion, count, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const slideMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: direction * 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -40 },
      };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative w-full overflow-hidden bg-black lg:min-h-[calc(100svh-5.05rem)]"
    >
      {/* Background wash, cross-faded between slides */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{ background: slide.gradient }}
        />
      </AnimatePresence>

      <div
        className="absolute inset-0 bg-no-repeat bg-contain bg-right opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "url('/images/backgrounds/hero-half-frame.svg')" }}
      />

      <div className="container relative z-10 flex flex-col lg:flex-row items-center gap-8 pt-10 pb-24 md:pt-14 md:pb-28 lg:min-h-[calc(100svh-5.05rem)] lg:py-20">
        {/* Copy */}
        <div className="flex-1 w-full text-white">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              {...slideMotion}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="inline-block mb-4 md:mb-5 px-3 md:px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs md:text-sm">
                {slide.eyebrow}
              </span>

              <h1 className="text-[2rem] leading-[1.15] md:text-5xl lg:text-6xl font-bold tracking-tight md:leading-[1.1] mb-4 md:mb-6 max-w-2xl">
                {slide.title}
              </h1>

              <p className="text-base md:text-lg text-white/90 max-w-2xl mb-7 md:mb-10 leading-relaxed">
                {slide.description}
              </p>

              <div className="flex flex-wrap gap-3 md:gap-4">
                <Button variant="default" size="xl" asChild>
                  <Link href={slide.primary.href}>{slide.primary.label}</Link>
                </Button>
                <Link
                  href={slide.secondary.href}
                  className="inline-flex items-center justify-center h-12 md:h-14 px-5 md:px-6 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-colors text-base md:text-lg"
                >
                  {slide.secondary.label}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Visual */}
        <div className="flex-1 w-full mt-6 lg:mt-0 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[560px] h-[240px] sm:h-[320px] md:h-[420px] lg:h-[500px]">
            {/* Crossfaded rather than swapped, so the frame is never empty. */}
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  // The first slide is the LCP image on the home page.
                  priority={index === 0}
                  className="object-contain object-center drop-shadow-2xl"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20">
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {HERO_SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(i, i > index ? 1 : -1)}
                aria-label={`Go to slide ${i + 1}: ${item.title}`}
                aria-current={i === index}
                className="group py-2"
              >
                <span
                  className={cn(
                    "block h-1 rounded-full transition-all duration-300",
                    i === index
                      ? "w-8 md:w-10 bg-primary"
                      : "w-4 md:w-5 bg-white/35 group-hover:bg-white/60"
                  )}
                />
              </button>
            ))}
            <span className="ml-1 md:ml-2 text-xs md:text-sm text-white/60 tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="w-11 h-11 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="w-11 h-11 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Live region for screen readers, since the slider moves on its own. */}
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {count}: {slide.title}
      </p>
    </section>
  );
}
