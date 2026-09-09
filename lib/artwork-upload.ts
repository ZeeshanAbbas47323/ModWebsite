/**
 * Products that need the customer to supply print-ready artwork.
 *
 * Two ways in, so the catalogue can express it either way:
 *  - a tag (`artwork-upload` is the purpose-built one; `dtf-transfer` is what
 *    some products already carry)
 *  - a slug containing the naming convention these products follow
 *
 * Both are env-configurable, so turning it on for a new product is a CMS
 * change rather than a deploy.
 */
const ARTWORK_TAGS = (
  process.env.NEXT_PUBLIC_ARTWORK_UPLOAD_TAGS ?? "artwork-upload,dtf-transfer"
)
  .split(",")
  .map((tag) => tag.trim().toLowerCase())
  .filter(Boolean);

const ARTWORK_SLUG_PATTERNS = (
  // "upload-your-" covers both the ready-to-print and upload-your-own families.
  // Builder products are named "build-your-…", so they never collide.
  process.env.NEXT_PUBLIC_ARTWORK_UPLOAD_SLUGS ?? "upload-your-"
)
  .split(",")
  .map((pattern) => pattern.trim().toLowerCase())
  .filter(Boolean);

export function needsArtworkUpload(product?: {
  tags?: string[] | null;
  slug?: string | null;
  name?: string | null;
} | null): boolean {
  if (!product) return false;

  const tagged = (product.tags ?? []).some((tag) =>
    ARTWORK_TAGS.includes(String(tag).trim().toLowerCase())
  );
  if (tagged) return true;

  const slug = (product.slug ?? "").toLowerCase();
  if (slug && ARTWORK_SLUG_PATTERNS.some((pattern) => slug.includes(pattern))) return true;

  // Some products carry the same "upload your own" naming in their display
  // name but a slug that doesn't happen to match (hand-edited, imported,
  // etc.) — checked the same way as the slug, kept as a separate check so
  // the slug rule above still catches everything it always has.
  const name = (product.name ?? "").toLowerCase();
  return !!name && ARTWORK_SLUG_PATTERNS.some((pattern) => name.includes(pattern.replace(/-/g, " ")));
}

export const MAX_ARTWORK_FILES = 10;
export const MAX_ARTWORK_BYTES = 100 * 1024 * 1024;

export const ARTWORK_ACCEPT =
  ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
