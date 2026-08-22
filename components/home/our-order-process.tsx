"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeOrderProcess } from "@/lib/map-home-order-process";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.15,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 },
  },
};

export function OurOrderProcess() {
  const { data: section, isLoading } = useHomeSection("home_order_process");
  const process = mapHomeOrderProcess(section);

  if (isLoading) {
    return (
      <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
        <div className="bg-black py-10 md:py-12 lg:py-16">
          <div className="container relative z-10 animate-pulse">
            <div className="h-12 w-80 bg-white/10 rounded-lg mb-4" />
            <div className="h-6 w-96 bg-white/10 rounded-lg mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[280px] rounded-[20px] bg-white/5"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!process || (!process.title && process.steps.length === 0)) {
    return null;
  }

  return (
    <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
      <div
        className="py-10 md:py-12 lg:py-16"
        style={{ backgroundColor: process.backgroundColor }}
      >
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] blur-[120px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
          style={{
            backgroundColor: process.glowColor,
            opacity: process.glowOpacity,
          }}
        />

        <div className="container relative z-10">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-6 md:mb-10"
          >
            {process.title ? (
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
                style={{ color: process.titleColor }}
              >
                {process.title}
              </h2>
            ) : null}
            {process.description ? (
              <p
                className="text-lg"
                style={{ color: process.descriptionColor }}
              >
                {process.description}
              </p>
            ) : null}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {process.steps.map((step) => (
              <motion.div
                key={step.id}
                variants={cardVariants}
                className="rounded-[20px] p-8 flex flex-col items-start"
                style={{ backgroundColor: process.cardBackgroundColor }}
              >
                {step.imageUrl ? (
                  <motion.div variants={cardItemVariants} className="mb-8">
                    <div className="relative w-18 h-18">
                      <Image
                        src={step.imageUrl}
                        alt={step.alt}
                        fill
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </motion.div>
                ) : null}
                {step.title ? (
                  <motion.h3
                    variants={cardItemVariants}
                    className="text-xl font-bold mb-4"
                    style={{ color: process.titleColor }}
                  >
                    {step.title}
                  </motion.h3>
                ) : null}
                {step.description ? (
                  <motion.p
                    variants={cardItemVariants}
                    className="text-base"
                    style={{ color: process.descriptionColor }}
                  >
                    {step.description}
                  </motion.p>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
