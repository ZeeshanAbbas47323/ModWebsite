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

const channels = [
  {
    icon: "/images/icons/phone-2.svg",
    title: "Call the Studio",
    detail: "(021) 12345678",
    sub: "Mon–Sat, 9:00 – 19:00 PKT",
    href: "tel:+922112345678",
  },
  {
    icon: "/images/icons/mail.svg",
    title: "Email Us",
    detail: "hello@modfirst.com",
    sub: "We reply in under 4 hours",
    href: "mailto:hello@modfirst.com",
  },
  {
    icon: "/images/icons/location.svg",
    title: "Visit Our Studio",
    detail: "Jinnah International Airport",
    sub: "Suite #4, Airport Commercial Zone, Karachi, Pakistan",
    href: "#",
  },
];

export function ContactInfo() {
  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {channels.map((c) => (
          <motion.a
            key={c.title}
            href={c.href}
            variants={cardVariants}
            className="bg-[#F8F9FA] rounded-2xl p-8 flex flex-col items-start hover:shadow-md transition-shadow"
          >
            <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Image src={c.icon} alt={c.title} width={26} height={26} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">{c.title}</h3>
            <p className="text-black text-base md:text-lg font-medium">{c.detail}</p>
            <p className="text-[#666] text-sm md:text-base mt-1 leading-snug">{c.sub}</p>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
