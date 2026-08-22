"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function ContactHero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-primary via-[#262e01] to-black" />
      <div
        className="absolute inset-0 bg-no-repeat bg-contain bg-right opacity-5"
        style={{ backgroundImage: "url('/images/backgrounds/hero-half-frame.svg')" }}
      />

      <div className="container relative z-10 py-16 md:py-20 lg:py-24 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary" />
          Get in Touch
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 max-w-3xl"
        >
          Let&apos;s print something<br className="hidden md:block" /> bold together
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-white max-w-2xl leading-relaxed"
        >
          Got a custom order, a tight deadline, or a question about artwork? Reach out — a real
          person from the Modfirst studio will get back to you within a few hours.
        </motion.p>

        {/* Floating stamp */}
        <div className="hidden lg:block absolute right-12 bottom-10 w-32 h-32 z-20 drop-shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
            className="relative w-full h-full"
          >
            <Image
              src="/images/banners-compositions/stamp.svg"
              alt="Feel the vibes stamp"
              fill
              className="object-contain animate-[spin_12s_linear_infinite]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
