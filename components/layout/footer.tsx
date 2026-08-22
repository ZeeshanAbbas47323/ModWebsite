"use client";

import Image from "next/image";
import Link from "next/link";
import { ModfirstRevealFooter } from "../home/modfirst-reveal-footer";
import { useFooterSections } from "@/hooks/use-footer-sections";
import type { FooterLink, FooterSection } from "@/services/footer-section.service";

const ICON_MAP: Record<string, string> = {
  "fa-phone": "/images/icons/phone-2.svg",
  "fa-envelope": "/images/icons/mail.svg",
  "fa-map-marker": "/images/icons/location.svg",
  "fa-map-marker-alt": "/images/icons/location.svg",
};

function sortedLinks(links: FooterLink[] | undefined) {
  return [...(links ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

function FooterNavLink({ link }: { link: FooterLink }) {
  const className = "text-white text-sm md:text-base";
  const isExternal =
    link.type === "url" ||
    link.url.startsWith("http") ||
    link.url.startsWith("tel:") ||
    link.url.startsWith("mailto:");

  if (isExternal || link.url === "#") {
    return (
      <a
        href={link.url}
        target={link.target || "_self"}
        rel={link.rel || undefined}
        className={className}
      >
        {link.name}
      </a>
    );
  }

  return (
    <Link href={link.url} className={className}>
      {link.name}
    </Link>
  );
}

function ContactLink({ link }: { link: FooterLink }) {
  const iconSrc = link.icon ? ICON_MAP[link.icon] : null;
  const content = (
    <>
      {iconSrc ? (
        <Image src={iconSrc} alt={link.name} width={24} height={24} />
      ) : null}
      <span className="text-white text-sm md:text-base leading-snug max-w-[300px]">
        {link.name}
      </span>
    </>
  );

  if (link.url && link.url !== "#") {
    return (
      <a href={link.url} className="flex items-start gap-3">
        {content}
      </a>
    );
  }

  return <div className="flex items-start gap-3">{content}</div>;
}

function LinkColumn({
  section,
  className,
  titleClassName = "text-2xl font-bold mb-6",
}: {
  section?: FooterSection;
  className: string;
  titleClassName?: string;
}) {
  if (!section) return null;

  return (
    <div className={`flex flex-col ${className}`}>
      {section.title ? (
        <h4 className={titleClassName}>{section.title}</h4>
      ) : null}
      <ul className="flex flex-col gap-4">
        {sortedLinks(section.links).map((link) => (
          <li key={link.id}>
            <FooterNavLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { data: sections = [], isLoading } = useFooterSections();

  const byKey = Object.fromEntries(
    sections.map((section) => [section.section_key, section])
  ) as Record<string, FooterSection>;

  const main = byKey.main_footer;
  const shop = byKey.shop;
  const policies = byKey.policies;
  const support = byKey.support;

  return (
    <>
      <footer className="bg-black text-white pt-10 md:pt-12 lg:pt-16 pb-6">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 md:pb-12 lg:pb-16 animate-pulse">
              <div className="lg:col-span-5 space-y-4">
                <div className="h-10 w-64 bg-white/10 rounded" />
                <div className="h-20 w-full max-w-md bg-white/5 rounded" />
                <div className="h-5 w-48 bg-white/5 rounded" />
                <div className="h-5 w-56 bg-white/5 rounded" />
              </div>
              <div className="lg:col-span-2 h-40 bg-white/5 rounded" />
              <div className="lg:col-span-2 h-40 bg-white/5 rounded" />
              <div className="lg:col-span-3 h-40 bg-white/5 rounded" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 md:pb-12 lg:pb-16">
              {main ? (
                <div className="lg:col-span-5 flex flex-col">
                  {main.title ? (
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">
                      {main.title}
                    </h3>
                  ) : null}
                  {main.description ? (
                    <p className="text-white text-sm md:text-base leading-relaxed mb-8 max-w-md">
                      {main.description}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-4">
                    {sortedLinks(main.links).map((link) => (
                      <ContactLink key={link.id} link={link} />
                    ))}
                  </div>
                </div>
              ) : null}

              <LinkColumn section={shop} className="lg:col-span-2" />
              <LinkColumn
                section={policies}
                className="lg:col-span-2"
                titleClassName="text-xl font-bold mb-6"
              />
              <LinkColumn section={support} className="lg:col-span-3" />
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/10 gap-6">
            <p className="text-[#A3A3A3] text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Modfirst. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-primary hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <Image
                  src="/images/icons/facebook.svg"
                  alt="Facebook"
                  width={14}
                  height={14}
                />
              </Link>
              <Link
                href="#"
                className="text-primary hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <Image
                  src="/images/icons/instagram.svg"
                  alt="Instagram"
                  width={18}
                  height={18}
                />
              </Link>
              <Link
                href="#"
                className="text-primary hover:text-white transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <Image
                  src="/images/icons/linkedin.svg"
                  alt="LinkedIn"
                  width={18}
                  height={18}
                />
              </Link>
              <Link
                href="#"
                className="text-primary hover:text-white transition-colors"
              >
                <span className="sr-only">Twitter / X</span>
                <Image
                  src="/images/icons/twittex-x.svg"
                  alt="twitter-x"
                  width={18}
                  height={18}
                />
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <ModfirstRevealFooter />
    </>
  );
}
