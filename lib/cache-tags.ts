/**
 * Cache tags for storefront content that the admin can change.
 *
 * Every cached upstream fetch carries one of these, and the backend POSTs the
 * matching tag to /api/revalidate after a write. That is what makes an edit in
 * the dashboard show up immediately instead of waiting out a TTL.
 *
 * These names are a contract with the backend - `REVALIDATION_TAGS` in
 * `backend/src/services/revalidationService.ts` must use the same strings.
 */
export const CACHE_TAGS = {
  products: "products",
  productCategories: "product-categories",
  menus: "menus",
  homeSections: "home-sections",
  footerSections: "footer-sections",
  popups: "popups",
  websiteSettings: "website-settings",
  blogs: "blogs",
  contentPages: "content-pages",
  reviews: "reviews",
  pickupLocations: "pickup-locations",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const ALL_CACHE_TAGS: CacheTag[] = Object.values(CACHE_TAGS);

export function isCacheTag(value: string): value is CacheTag {
  return (ALL_CACHE_TAGS as string[]).includes(value);
}
