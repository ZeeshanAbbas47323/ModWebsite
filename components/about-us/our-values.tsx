"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const values = [
  {
    img_path: "/images/icons/star.svg",
    title: "Premium Quality",
    description:
      "Every print is colour-matched, washed-tested and inspected before it ships. We don't cut corners on inks, films or finishing.",
  },
  {
    img_path: "/images/icons/cloud.svg",
    title: "No Minimums",
    description:
      "Order one piece or ten thousand — the same studio, the same standards, the same friendly pricing curve.",
  },
  {
    img_path: "/images/icons/package.svg",
    title: "Fast Turnaround",
    description:
      "Most orders ship within 24 hours. Rush options get your boxes on the road the same day they're placed.",
  },
  {
    img_path: "/images/icons/phone.svg",
    title: "Real People",
    description:
      "A human reviews every artwork file and answers every message. No tickets, no scripts — just printers who care.",
  },
];

export function OurValues() {
  return (
    <section className="relative w-full pt-10 md:pt-12 lg:pt-16 overflow-hidden">
      <div className="bg-black py-10 md:py-12 lg:py-16 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary opacity-40 blur-[120px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3" />

        <div className="container relative z-10">
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-6 md:mb-10 max-w-2xl"
          >
            <span className="text-primary font-bold uppercase tracking-wider text-sm">What We Stand For</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-3 tracking-tight">
              Four values, zero compromise
            </h2>
            <p className="text-[#E3D9D9] text-lg">
              The principles every Modfirst order is held to — from a single DTF transfer to a stadium-sized banner.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={cardVariants}
                className="bg-[#191717] rounded-[20px] p-8 flex flex-col items-start"
              >
                <div className="mb-8">
                  <div className="relative w-16 h-16 flex items-center justify-center bg-primary/10 rounded-2xl">
                    <Image src={v.img_path} alt={v.title} width={32} height={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{v.title}</h3>
                <p className="text-[#E3D9D9] text-base leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
