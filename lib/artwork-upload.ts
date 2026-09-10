
const ARTWORK_TAGS = (
  process.env.NEXT_PUBLIC_ARTWORK_UPLOAD_TAGS ?? "artwork-upload,dtf-transfer"
)
  .split(",")
  .map((tag) => tag.trim().toLowerCase())
  .filter(Boolean);

const ARTWORK_SLUG_PATTERNS = (


  process.env.NEXT_PUBLIC_ARTWORK_UPLOAD_SLUGS ?? "upload-your-"
)
  .split(",")
  .map((pattern) => pattern.trim().toLowerCase())
  .filter(Boolean);

/**
 * Categories whose products always take a customer artwork upload, on top of
 * the tag and slug rules below. Sub-categories are included at the call site.
 */
export const ARTWORK_CATEGORY_IDS = (
  process.env.NEXT_PUBLIC_ARTWORK_UPLOAD_CATEGORIES ?? "79"
)
  .split(",")
  .map((id) => Number(id.trim()))
  .filter((id) => Number.isFinite(id));

export function needsArtworkUpload(
  product?: {
    tags?: string[] | null;
    slug?: string | null;
    name?: string | null;
    category_id?: number | null;
    category?: { id?: number } | null;
  } | null,
  /** Enforced category ids, expanded to include sub-categories. */
  artworkCategoryIds?: Set<number>
): boolean {
  if (!product) return false;

  const categoryId = product.category_id ?? product.category?.id ?? null;
  if (categoryId != null) {
    const ids = artworkCategoryIds ?? new Set(ARTWORK_CATEGORY_IDS);
    if (ids.has(categoryId)) return true;
  }

  const tagged = (product.tags ?? []).some((tag) =>
    ARTWORK_TAGS.includes(String(tag).trim().toLowerCase())
  );
  if (tagged) return true;

  const slug = (product.slug ?? "").toLowerCase();
  if (slug && ARTWORK_SLUG_PATTERNS.some((pattern) => slug.includes(pattern))) return true;

  const name = (product.name ?? "").toLowerCase();
  return !!name && ARTWORK_SLUG_PATTERNS.some((pattern) => name.includes(pattern.replace(/-/g, " ")));
}

export const MAX_ARTWORK_FILES = 10;
export const MAX_ARTWORK_BYTES = 100 * 1024 * 1024;

export const ARTWORK_ACCEPT =
  ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
