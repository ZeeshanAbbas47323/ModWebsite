import { menuData } from "@/lib/menu-data";
import type { MenuNode } from "@/services/menu.service";

export function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/[\r\n]+/g, " ").trim();
}

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
  if (segments.length === 1 && segments[0].toLowerCase() === "home") return "/";
  return `/${segments.join("/")}`;
}

const STATIC_PAGE_SLUGS: Record<string, string> = {
  "contact us": "/contact-us",
  "net 30": "/net-30",
  "embroidery-services": "/embroidery-services",
};

export function getMenuHref(node: MenuNode): string | undefined {
  if (node.link_type === "external" && node.external_url) return node.external_url;

  if (node.link_type === "category") {
    const cleanedSlug = clean(node.slug).toLowerCase();
    const staticPage = STATIC_PAGE_SLUGS[cleanedSlug];
    if (staticPage) return staticPage;

    const slug = pathFromSlug(node.slug);
    if (slug && !slug.startsWith("/products/")) return `/categories${slug}`;
    return slug;
  }

  if (node.link_type === "product" && node.target_product_id) {
    return `/product-detail?id=${node.target_product_id}`;
  }
  if (node.link_type === "page" && node.target_page_id) return `/pages/${clean(node.slug)}`;
  if (node.link_value) return clean(node.link_value) || undefined;
  return pathFromSlug(node.slug);
}

export interface NavItem {
  id: number | string;
  label: string;
  href?: string;
  openInNewTab?: boolean;
  children?: NavItem[];
}

const HIDDEN_MENU_NAMES = new Set(["rush order"]);

export function mapMenuNodes(nodes: MenuNode[]): NavItem[] {
  return nodes
    .filter((n) => !HIDDEN_MENU_NAMES.has(clean(n.name).toLowerCase()))
    .map((n) => ({
      id: n.id,
      label: clean(n.name),
      href: n.children?.length ? undefined : getMenuHref(n),
      openInNewTab: n.open_in_new_tab,
      children: n.children?.length ? mapMenuNodes(n.children) : undefined,
    }));
}

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

export function useNavItems(nodes: MenuNode[] | undefined): NavItem[] {
  return nodes?.length ? mapMenuNodes(nodes) : fallbackNavItems;
}
