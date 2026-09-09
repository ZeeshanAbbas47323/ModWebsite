
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

  const name = (product.name ?? "").toLowerCase();
  return !!name && ARTWORK_SLUG_PATTERNS.some((pattern) => name.includes(pattern.replace(/-/g, " ")));
}

export const MAX_ARTWORK_FILES = 10;
export const MAX_ARTWORK_BYTES = 100 * 1024 * 1024;

export const ARTWORK_ACCEPT =
  ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
