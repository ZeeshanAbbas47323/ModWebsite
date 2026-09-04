"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useMenuTree } from "@/hooks/use-menus";
import { useNavItems, type NavItem } from "@/lib/menu-nav";

/** How long the panel survives the pointer leaving, so a diagonal move to it
 *  does not close it. */
const CLOSE_DELAY = 140;

/** Space kept for the "More" button when the bar cannot fit every item. */
const MORE_WIDTH = 96;

/** Identifies the synthetic item holding whatever did not fit. */
const OVERFLOW_ID = "__more__";

const ITEM_CLASS =
  "relative flex items-center gap-1.5 px-3 py-3.5 text-[13px] font-semibold uppercase " +
  "tracking-wide whitespace-nowrap transition-colors";

/**
 * Desktop navigation.
 *
 * The catalogue is three levels deep, and stepping through it one level at a
 * time — which is all the drawer can do — takes three clicks to reach a
 * product. Here a whole branch opens at once: the second level becomes the
 * column headings and the third level the links under them.
 */
export function MegaMenu() {
  const { data: menuNodes } = useMenuTree();
  const items = useNavItems(menuNodes);
  const [openId, setOpenId] = useState<NavItem["id"] | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY);
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (openId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);

  const { barRef, measureRef, visibleCount } = useFittedItems(items.length);

  if (items.length === 0) return null;

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);
  const open =
    openId === OVERFLOW_ID
      ? { id: OVERFLOW_ID, label: "More", children: overflow }
      : (items.find((item) => item.id === openId) ?? null);

  return (
    <nav
      aria-label="Main"
      className="relative hidden lg:block border-t border-black/5 bg-white"
      onMouseLeave={scheduleClose}
    >
      <div className="container">
        {/* Off-screen copy at full width, so the widths stay measurable even
            once items have been moved into "More". The clipping wrapper is
            required: an absolutely positioned row still counts towards the
            document's scroll width, which would give the page a horizontal
            scrollbar as wide as the whole menu. */}
        <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden">
          <ul ref={measureRef} className="flex items-stretch gap-1">
            {items.map((item) => (
              <li key={item.id} className={`${ITEM_CLASS} shrink-0`}>
                {item.label}
                {item.children?.length ? <span className="w-[10px]" /> : null}
              </li>
            ))}
          </ul>
        </div>

        <ul ref={barRef} className="flex items-stretch gap-1 overflow-hidden">
          {visible.map((item) => (
            <TopLevelItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              panelId={panelId}
              onOpen={(id) => { cancelClose(); setOpenId(id); }}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}

          {overflow.length > 0 && (
            <TopLevelItem
              item={{ id: OVERFLOW_ID, label: "More", children: overflow }}
              isOpen={openId === OVERFLOW_ID}
              panelId={panelId}
              onOpen={(id) => { cancelClose(); setOpenId(id); }}
              onToggle={() => setOpenId(openId === OVERFLOW_ID ? null : OVERFLOW_ID)}
            />
          )}
        </ul>
      </div>

      {open?.children?.length ? (
        <div
          id={panelId}
          key={open.id}
          onMouseEnter={cancelClose}
          className="mega-panel absolute inset-x-0 top-full z-50 border-t border-black/5 bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)]"
        >
          <MegaPanel item={open} onNavigate={() => setOpenId(null)} />
        </div>
      ) : null}

    </nav>
  );
}

function MegaPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const columns = item.children ?? [];
  // A branch whose children are all leaves has no headings to hang links
  // under, so it reads better as a plain list of links.
  const flat = columns.every((column) => !column.children?.length);

  if (flat) {
    return (
      <div className="container py-8">
        <ul className="grid gap-x-8 gap-y-1 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {columns.map((column) => (
            <li key={column.id}>
              <Link
                href={column.href ?? "#"}
                target={column.openInNewTab ? "_blank" : undefined}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 -mx-3 text-sm font-medium text-neutral-700 transition-colors hover:border-black/10 hover:bg-neutral-50 hover:text-black"
              >
                <span className="leading-snug">{column.label}</span>
                <span className="shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Five across still leaves a readable column; past that the labels crowd.
  const cols = Math.min(columns.length, 5);

  return (
    <div className="container py-8">
      <div
        className="grid gap-x-10 gap-y-8"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <div key={column.id} className="min-w-0">
            <ColumnHeading item={column} onNavigate={onNavigate} />

            {column.children?.length ? (
              <ul className="mt-3 flex flex-col gap-1">
                {column.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={child.href ?? "#"}
                      target={child.openInNewTab ? "_blank" : undefined}
                      onClick={onNavigate}
                      className="group flex items-start gap-2 rounded-md px-2 py-1.5 -mx-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-300 transition-colors group-hover:bg-primary" />
                      <span className="leading-snug">{child.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A column heading links when the CMS gave it somewhere to go. */
function ColumnHeading({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const text = (
    <span className="text-[13px] font-bold uppercase tracking-wide text-black">
      {item.label}
    </span>
  );

  return (
    <div className="border-b border-black/10 pb-2">
      {item.href ? (
        <Link
          href={item.href}
          target={item.openInNewTab ? "_blank" : undefined}
          onClick={onNavigate}
          className="group inline-flex items-baseline gap-1.5 hover:opacity-80 transition-opacity"
        >
          {text}
          <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
            →
          </span>
        </Link>
      ) : (
        text
      )}
    </div>
  );
}


/**
 * How many top-level items fit on one row.
 *
 * The menu comes from the CMS, so the bar has to cope with any number of
 * items at any width rather than a count picked at build time. Widths are
 * read from an off-screen copy that always holds every item, so removing one
 * from the bar cannot change the measurement it was based on.
 */
function useFittedItems(count: number) {
  const barRef = useRef<HTMLUListElement | null>(null);
  const measureRef = useRef<HTMLUListElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(count);

  const fit = useCallback(() => {
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!bar || !measure) return;

    const widths = Array.from(measure.children, (el) => (el as HTMLElement).offsetWidth);
    const gap = parseFloat(getComputedStyle(measure).columnGap || "0") || 0;
    // The row is a block, so its own content box is the space to fill — the
    // container's clientWidth would include its horizontal padding.
    const available = bar.clientWidth;

    const total = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(widths.length - 1, 0);
    if (total <= available) {
      setVisibleCount(widths.length);
      return;
    }

    let used = 0;
    let fits = 0;
    for (const width of widths) {
      const next = used + width + (fits > 0 ? gap : 0);
      if (next + gap + MORE_WIDTH > available) break;
      used = next;
      fits += 1;
    }
    // Never collapse everything — one item plus "More" is the floor.
    setVisibleCount(Math.max(fits, 1));
  }, []);

  useEffect(() => {
    fit();
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [fit, count]);

  return { barRef, measureRef, visibleCount };
}

interface TopLevelItemProps {
  item: NavItem;
  isOpen: boolean;
  panelId: string;
  onOpen: (id: NavItem["id"] | null) => void;
  onToggle: () => void;
}

function TopLevelItem({ item, isOpen, panelId, onOpen, onToggle }: TopLevelItemProps) {
  const hasPanel = !!item.children?.length;
  const className = [
    ITEM_CLASS,
    isOpen ? "text-black" : "text-neutral-700 hover:text-black",
    // The indicator doubles as the visual join to the open panel.
    "after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-full",
    "after:bg-primary after:transition-transform after:duration-200 after:origin-center",
    isOpen ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
  ].join(" ");

  return (
    <li onMouseEnter={() => onOpen(hasPanel ? item.id : null)}>
      {hasPanel ? (
        <button
          type="button"
          className={className}
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          onClick={onToggle}
          onFocus={() => onOpen(item.id)}
        >
          {item.label}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
            className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              d="M1 3.5 5 7.5 9 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <Link
          href={item.href ?? "#"}
          target={item.openInNewTab ? "_blank" : undefined}
          className={className}
          onFocus={() => onOpen(null)}
          onClick={() => onOpen(null)}
        >
          {item.label}
        </Link>
      )}
    </li>
  );
}
