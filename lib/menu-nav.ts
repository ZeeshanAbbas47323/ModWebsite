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

export function getMenuHref(node: MenuNode): string | undefined {
  if (node.link_type === "external" && node.external_url) return node.external_url;
  if (node.link_type === "category" && node.target_category_id)
    return `/products?category=${node.target_category_id}`;
  if (node.link_type === "product" && node.target_product_id)
    return `/product-detail?id=${node.target_product_id}`;
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
