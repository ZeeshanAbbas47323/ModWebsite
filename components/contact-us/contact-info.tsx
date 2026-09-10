"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { resolveImageUrl } from "@/lib/image-url";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/** Numbers are shown formatted but have to dial unformatted. */
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export function ContactInfo() {
  const { data: settings } = useWebsiteSettings();

  const phone = settings?.contact_phone?.trim();
  const email = settings?.contact_email?.trim() || settings?.support_email?.trim();
  const support = settings?.support_email?.trim();
  const address = settings?.address?.trim();

  const cityLine = [
    settings?.city?.trim(),
    settings?.province_code?.trim(),
    settings?.postal_code?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  // Every value comes from Website Settings, so the studio's details live in
  // one place with the footer rather than being duplicated in the markup.
  const channels = [
    phone && {
      icon: "/images/icons/phone-2.svg",
      title: "Call the Studio",
      detail: phone,
      sub: settings?.business_hours?.trim() ?? "",
      href: telHref(phone),
      external: false,
    },
    email && {
      icon: "/images/icons/mail.svg",
      title: "Email Us",
      detail: email,
      sub: support && support !== email ? `Support: ${support}` : "",
      href: `mailto:${email}`,
      external: false,
    },
    address && {
      icon: "/images/icons/location.svg",
      title: "Visit Our Studio",
      detail: address,
      sub: cityLine,
      href: `https://maps.google.com/?q=${encodeURIComponent(
        [address, cityLine].filter(Boolean).join(", ")
      )}`,
      external: true,
    },
  ].filter(Boolean) as {
    icon: string;
    title: string;
    detail: string;
    sub: string;
    href: string;
    external: boolean;
  }[];

  // Settings still loading, or none of these filled in: render nothing rather
  // than a row of empty cards.
  if (!channels.length) return null;

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
            {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
            variants={cardVariants}
            className="bg-[#F8F9FA] rounded-2xl p-8 flex flex-col items-start hover:shadow-md transition-shadow"
          >
            <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Image src={resolveImageUrl(c.icon)} alt="" width={26} height={26} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">{c.title}</h3>
            <p className="text-black text-base md:text-lg font-medium">{c.detail}</p>
            {c.sub && (
              <p className="text-[#666] text-sm md:text-base mt-1 leading-snug">
                {c.sub}
              </p>
            )}
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
