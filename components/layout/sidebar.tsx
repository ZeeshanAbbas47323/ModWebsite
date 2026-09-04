"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenuTree } from "@/hooks/use-menus";
import { useNavItems, type NavItem } from "@/lib/menu-nav";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Small-screen navigation.
 *
 * An accordion rather than a drill-down: a branch expands in place, so the
 * level above stays visible and a third-level product is one tap away instead
 * of three. Everything here is CSS-driven — a stalled animation frame can no
 * longer strand the menu between levels.
 */
export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { data: menuNodes } = useMenuTree();
  const { data: settings } = useWebsiteSettings();
  const items = useNavItems(menuNodes);
  const [expanded, setExpanded] = useState<Set<NavItem["id"]>>(new Set());

  const phone = settings?.contact_phone ?? "";
  const email = settings?.contact_email ?? "";
  const address = settings?.address ?? "";

  const socials = [
    { href: settings?.facebook_url, icon: "/images/icons/facebook.svg", label: "Facebook", size: 14 },
    { href: settings?.instagram_url, icon: "/images/icons/instagram.svg", label: "Instagram", size: 18 },
    { href: settings?.linkedin_url, icon: "/images/icons/linkedin.svg", label: "LinkedIn", size: 18 },
    { href: settings?.twitter_url, icon: "/images/icons/twittex-x.svg", label: "X", size: 18 },
  ].filter((s): s is typeof s & { href: string } => !!s.href);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const close = () => {
    setExpanded(new Set());
    onClose();
  };

  const toggle = (id: NavItem["id"]) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={close}
        className="drawer-scrim fixed inset-0 z-100 bg-black/60"
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="drawer-panel fixed inset-y-0 left-0 z-101 flex w-full max-w-sm flex-col bg-[#111] text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Menu
          </span>
          <button
            onClick={close}
            aria-label="Close menu"
            className="rounded-full p-2 transition-colors hover:bg-white/10"
          >
            <Image src="/images/icons/x.svg" alt="" width={18} height={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <ul className="flex flex-col">
            {items.map((item) => (
              <AccordionRow
                key={item.id}
                item={item}
                depth={0}
                expanded={expanded}
                onToggle={toggle}
                onNavigate={close}
              />
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-5">
          <div className="flex flex-col gap-3 text-sm text-white/70">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-3 transition-colors hover:text-[#D3F52E]"
              >
                <Image src="/images/icons/phone-2.svg" alt="" width={16} height={16} />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 transition-colors hover:text-[#D3F52E]"
              >
                <Image src="/images/icons/mail.svg" alt="" width={16} height={16} />
                <span>{email}</span>
              </a>
            )}
            {address && (
              <div className="flex items-start gap-3">
                <Image src="/images/icons/location.svg" alt="" width={16} height={16} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{address}</span>
              </div>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="transition-opacity hover:opacity-70"
                >
                  <Image src={social.icon} alt="" width={social.size} height={social.size} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface AccordionRowProps {
  item: NavItem;
  depth: number;
  expanded: Set<NavItem["id"]>;
  onToggle: (id: NavItem["id"]) => void;
  onNavigate: () => void;
}

function AccordionRow({ item, depth, expanded, onToggle, onNavigate }: AccordionRowProps) {
  const hasChildren = !!item.children?.length;
  const isOpen = expanded.has(item.id);

  // Each level steps in a little so the shape of the tree stays readable.
  const rowClass = [
    "flex w-full items-center justify-between gap-3 rounded-lg py-3 pr-3 text-left transition-colors",
    depth === 0
      ? "text-[15px] font-semibold text-white"
      : "text-[14px] font-normal text-white/70",
    "hover:bg-white/5 hover:text-[#D3F52E]",
  ].join(" ");

  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          aria-expanded={isOpen}
          className={rowClass}
          style={{ paddingLeft: 12 + depth * 14 }}
        >
          <span className="leading-snug">{item.label}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            aria-hidden
            className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="M1 3.5 5 7.5 9 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <Link
          href={item.href ?? "#"}
          target={item.openInNewTab ? "_blank" : undefined}
          onClick={onNavigate}
          className={rowClass}
          style={{ paddingLeft: 12 + depth * 14 }}
        >
          <span className="leading-snug">{item.label}</span>
        </Link>
      )}

      {hasChildren && isOpen && (
        <ul className="ml-[18px] flex flex-col border-l border-white/10">
          {item.children!.map((child) => (
            <AccordionRow
              key={child.id}
              item={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
