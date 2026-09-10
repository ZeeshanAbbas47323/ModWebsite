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

/**
 * Opening hours are stored as one string with "|" between the day ranges.
 * Left whole it wrapped mid-sentence and made this card taller than the other
 * two, so each range gets its own line.
 */
const splitLines = (value?: string) =>
  (value ?? "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

export function ContactInfo() {
  const { data: settings } = useWebsiteSettings();

  const phone = settings?.contact_phone?.trim();
  const email = settings?.contact_email?.trim() || settings?.support_email?.trim();
  const support = settings?.support_email?.trim();
  const address = settings?.address?.trim();

  const city = settings?.city?.trim();
  const cityLine = [city, settings?.province_code?.trim(), settings?.postal_code?.trim()]
    .filter(Boolean)
    .join(", ");

  // `address` usually already spells out the city and state, so repeating them
  // underneath just read as a duplicate. Keep the second line only when it adds
  // something the address does not already say — a postcode, typically.
  const addressSub =
    address && city && address.toLowerCase().includes(city.toLowerCase())
      ? settings?.postal_code?.trim() ?? ""
      : cityLine;

  // Every value comes from Website Settings, so the studio's details live in
  // one place with the footer rather than being duplicated in the markup.
  const channels = [
    phone && {
      icon: "/images/icons/phone-2.svg",
      title: "Call the Studio",
      detail: phone,
      sub: splitLines(settings?.business_hours),
      href: telHref(phone),
      external: false,
    },
    email && {
      icon: "/images/icons/mail.svg",
      title: "Email Us",
      detail: email,
      sub: support && support !== email ? [`Support: ${support}`] : [],
      href: `mailto:${email}`,
      external: false,
    },
    address && {
      icon: "/images/icons/location.svg",
      title: "Visit Our Studio",
      detail: address,
      sub: addressSub ? [addressSub] : [],
      href: `https://maps.google.com/?q=${encodeURIComponent(
        [address, cityLine].filter(Boolean).join(", ")
      )}`,
      external: true,
    },
  ].filter(Boolean) as {
    icon: string;
    title: string;
    detail: string;
    sub: string[];
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
      >
        {channels.map((c) => (
          <motion.a
            key={c.title}
            href={c.href}
            {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
            variants={cardVariants}
            // h-full so a card with two lines of hours does not leave the
            // others short; the title block grows and the detail stays put.
            className="bg-[#F8F9FA] rounded-2xl p-8 h-full flex flex-col items-start hover:shadow-md transition-shadow"
          >
            <div className="mb-6 w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Image src={resolveImageUrl(c.icon)} alt="" width={26} height={26} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">{c.title}</h3>
            <p className="text-black text-base md:text-lg font-medium break-words">
              {c.detail}
            </p>
            {c.sub.length > 0 && (
              <div className="mt-1.5 flex flex-col gap-0.5">
                {c.sub.map((line) => (
                  <p
                    key={line}
                    className="text-[#666] text-sm leading-relaxed break-words"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
