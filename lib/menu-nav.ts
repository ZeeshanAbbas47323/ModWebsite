import { menuData } from "@/lib/menu-data";
import type { MenuNode } from "@/services/menu.service";

/** CMS text arrives with stray CRLF and padding; strip it before use. */
export function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/[\r\n]+/g, " ").trim();
}

/**
 * Turn a CMS slug into a usable path.
 *
 * Slugs are authored by hand, so they arrive as anything from "shop/test/" to
 * "UV DTF Transfers" to "Net 30". Each segment is encoded so spaces and
 * brackets survive as a valid URL instead of silently breaking the link.
 */
export function pathFromSlug(slug: string | null | undefined): string | undefined {
  const raw = clean(slug);
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;

  const segments = raw
    .split("/")
    .map((segment) => clean(segment))
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));

  if (segments.length === 0) return undefined;
  // "home" is the storefront root, not a /home page.
  if (segments.length === 1 && segments[0].toLowerCase() === "home") return "/";
  return `/${segments.join("/")}`;
}

/**
 * A handful of menu rows are labelled "category" but are actually one of the
 * site's static pages — bad authoring, not something a slug format can tell
 * apart on its own. Matched case-insensitively against the cleaned slug.
 */
const STATIC_PAGE_SLUGS: Record<string, string> = {
  "contact us": "/contact-us",
  "net 30": "/net-30",
  "dtf supplies": "/dtf-supplies",
};

/**
 * A few more "category" menu items name a group of products (T-Shirts,
 * Hoodies) with no real ProductCategory behind them — checked directly
 * against the database, there simply is no such category. Rather than
 * invent one, these route to a real-data-driven search listing
 * (/products?q=<name>, backed by the same search endpoint used elsewhere)
 * instead of a dead /categories/<slug> page.
 */
const SEARCH_LISTING_SLUGS: Record<string, string> = {
  "t-shirts": "T-Shirts",
  "hoodies": "Hoodies",
  "hat-heat-press": "Heat Press",
};

export function getMenuHref(node: MenuNode): string | undefined {
  if (node.link_type === "external" && node.external_url) return node.external_url;

  if (node.link_type === "category") {
    const cleanedSlug = clean(node.slug).toLowerCase();
    const staticPage = STATIC_PAGE_SLUGS[cleanedSlug];
    if (staticPage) return staticPage;

    const searchQuery = SEARCH_LISTING_SLUGS[cleanedSlug];
    if (searchQuery) return `/products?q=${encodeURIComponent(searchQuery)}`;

    // `target_category_id` points at a legacy `Category` table with no
    // relation to the real catalog (`ProductCategory`, which
    // `/categories/[slug]` actually reads) — every menu authored so far has
    // it null anyway. The slug is what these menus were actually built with,
    // so route through the real collection page by slug instead. A slug that
    // already looks like a product path ("products/...") is a product page
    // that was mislabeled "category" — send it there directly rather than
    // wrapping it in /categories.
    const slug = pathFromSlug(node.slug);
    if (slug && !slug.startsWith("/products/")) return `/categories${slug}`;
    return slug;
  }

  if (node.link_type === "product" && node.target_product_id) {
    // Route through /product-detail?id=, which now redirects server-side to
    // the real /products/<slug> before anything renders — so the address
    // bar never actually shows ?id=, but this never depends on the menu's
    // own `slug` column matching the product's real slug. It can't: Menu.slug
    // is capped at 100 chars and some real product slugs run past that (the
    // stored value gets silently truncated), which 404'd every one of them
    // when this used to build /products/<menu.slug> directly.
    return `/product-detail?id=${node.target_product_id}`;
  }
  if (node.link_type === "page" && node.target_page_id) return `/pages/${clean(node.slug)}`;
  if (node.link_value) return clean(node.link_value) || undefined;
  // Nothing else is configured on these menus, so the slug is the only
  // routing information available.
  return pathFromSlug(node.slug);
}

export interface NavItem {
  id: number | string;
  label: string;
  href?: string;
  openInNewTab?: boolean;
  children?: NavItem[];
}

export function mapMenuNodes(nodes: MenuNode[]): NavItem[] {
  return nodes.map((n) => ({
    id: n.id,
    label: clean(n.name),
    // A node with children opens the next level instead of navigating, so only
    // leaves ever get a link.
    href: n.children?.length ? undefined : getMenuHref(n),
    openInNewTab: n.open_in_new_tab,
    children: n.children?.length ? mapMenuNodes(n.children) : undefined,
  }));
}

/** Shipped menu, used until the CMS tree arrives (and if it comes back empty). */
export const fallbackNavItems: NavItem[] = menuData.map((m) => ({
  id: m.id,
  label: m.label,
  href: m.href,
  children: m.children?.map((c) => ({
    id: c.id,
    label: c.label,
    href: c.href,
    children: c.children?.map((gc) => ({ id: gc.id, label: gc.label, href: gc.href })),
  })),
}));

/** The storefront's navigation, from the CMS when it is available. */
export function useNavItems(nodes: MenuNode[] | undefined): NavItem[] {
  return nodes?.length ? mapMenuNodes(nodes) : fallbackNavItems;
}
