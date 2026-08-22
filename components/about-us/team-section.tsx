"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const team = [
  { name: "Jamie Khan", role: "Founder & Print Lead", avatar: "/images/avatars/avatar-1.jpg" },
  { name: "Sara Ahmed", role: "Production Manager", avatar: "/images/avatars/avatar-2.jpg" },
  { name: "Bilal Iqbal", role: "Artwork & QA", avatar: "/images/avatars/avatar-3.jpg" },
  { name: "Aisha Raza", role: "Customer Success", avatar: "/images/avatars/avatar-4.jpg" },
];

export function TeamSection() {
  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6 md:mb-10">
        <div className="max-w-2xl">
          <span className="text-primary font-bold uppercase tracking-wider text-sm">Meet the Team</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mt-3 tracking-tight">
            The people behind every print
          </h2>
        </div>
        <p className="text-[#666] text-base md:text-lg max-w-md">
          A small studio crew who answer every email, double-check every gang sheet, and pack every box.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {team.map((m) => (
          <motion.div
            key={m.name}
            variants={cardVariants}
            className="bg-[#F8F9FA] rounded-2xl p-6 flex flex-col items-center text-center"
          >
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-5 ring-4 ring-primary/30">
              <Image src={m.avatar} alt={m.name} fill className="object-cover" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-black">{m.name}</h3>
            <p className="text-[#666] text-sm md:text-base mt-1">{m.role}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
