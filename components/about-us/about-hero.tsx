"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AboutHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background gradient — mirrors home hero */}
      <div className="absolute inset-0 bg-linear-to-b from-primary via-[#262e01] to-black" />
      <div
        className="absolute inset-0 bg-no-repeat bg-contain bg-right opacity-5"
        style={{ backgroundImage: "url('/images/backgrounds/hero-half-frame.svg')" }}
      />

      <div className="container relative z-10 flex flex-col lg:flex-row items-center gap-10 py-16 md:py-20 lg:py-24">
        {/* Left content */}
        <div className="flex-1 w-full text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary" />
            About Modfirst
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Bold prints.<br className="hidden md:block" /> Made with care.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-white max-w-2xl mb-10 leading-relaxed"
          >
            Modfirst is a custom printing studio built for creators, small brands, and big-event teams.
            We pair premium DTF, sublimation, embroidery and large-format printing with a turnaround that
            actually fits your launch date.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button variant="default" size="xl">Shop Now</Button>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center h-14 px-6 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors text-lg"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>

        {/* Right image composition */}
        <div className="flex-1 w-full mt-12 lg:mt-0 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[600px] h-[420px] md:h-[480px]">
            <div className="absolute left-0 bottom-0 w-[62%] h-[78%] rounded-4xl overflow-hidden shadow-2xl z-10">
              <motion.div
                initial={{ opacity: 0, x: -40, y: 40 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src="/images/branding/girl-with-phone.jpg"
                  alt="Modfirst customer"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </div>

            <div className="absolute right-0 top-0 w-[50%] h-[60%] rounded-4xl overflow-hidden shadow-2xl z-20">
              <motion.div
                initial={{ opacity: 0, x: 40, y: -40 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src="/images/branding/tiger-laser-print.jpg"
                  alt="Tiger laser print"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

            <div className="absolute top-[14%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 z-30 drop-shadow-2xl">
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
        </div>
      </div>
    </section>
  );
}
