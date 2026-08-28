import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Object storage for customer artwork.
 *
 * Cloudflare R2 is S3-compatible, so one client covers both. R2 wins when it
 * is configured; otherwise the AWS bucket is used, which keeps older uploads
 * reachable while the switch happens.
 */
const R2_ENDPOINT = process.env.R2_ENDPOINT ?? "";
const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";
const R2_KEY = process.env.R2_ACCESS_KEY_ID ?? "";
const R2_SECRET = process.env.R2_SECRET_ACCESS_KEY ?? "";

const S3_BUCKET_ENV = process.env.AWS_BUCKET_NAME ?? "";
const S3_REGION = process.env.AWS_REGION ?? "us-east-1";

export const usingR2 = Boolean(R2_ENDPOINT && R2_BUCKET && R2_KEY && R2_SECRET);

/**
 * Half-configured R2 silently falls back to AWS, which looks like the switch
 * simply did not happen. Say so once at startup instead.
 */
if (!usingR2 && (R2_ENDPOINT || R2_BUCKET)) {
  const missing = [
    !R2_ENDPOINT && "R2_ENDPOINT",
    !R2_BUCKET && "R2_BUCKET_NAME",
    !R2_KEY && "R2_ACCESS_KEY_ID",
    !R2_SECRET && "R2_SECRET_ACCESS_KEY",
  ].filter(Boolean);
  console.warn(
    `[storage] R2 is only partly configured (missing: ${missing.join(", ")}). ` +
      "Falling back to AWS S3."
  );
}

/** Which backend an upload actually landed in. */
export const STORAGE_PROVIDER = usingR2 ? "r2" : "s3";

export const STORAGE_BUCKET = usingR2 ? R2_BUCKET : S3_BUCKET_ENV;

/**
 * Public base for finished objects, e.g. an R2 public bucket
 * (`https://pub-….r2.dev`) or a custom domain. When set, uploads return that
 * URL directly and no signing is needed at all.
 */
export const PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

/** SigV4 refuses anything past 7 days, so clamp rather than fail at signing. */
const MAX_PRESIGN_TTL = 604_800;

/**
 * How long each redirect from /api/files stays valid. It only has to outlive
 * the download itself — the link customers and staff keep never expires,
 * because every visit mints a new signature.
 */
export const PRESIGN_TTL = Math.min(
  MAX_PRESIGN_TTL,
  Math.max(60, Number(process.env.S3_PRESIGN_TTL ?? 900))
);

export function isStorageConfigured() {
  return Boolean(STORAGE_BUCKET);
}

let client: S3Client | null = null;
let legacy: S3Client | null = null;

/**
 * The AWS bucket used before the move to R2. Artwork uploaded then is still
 * referenced by live carts and orders, so those links must keep working.
 */
export const LEGACY_BUCKET = usingR2 ? S3_BUCKET_ENV : "";

export function legacyClient(): S3Client | null {
  if (!LEGACY_BUCKET) return null;
  if (legacy) return legacy;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  legacy = new S3Client({
    region: S3_REGION,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
  return legacy;
}

export function storageClient(): S3Client {
  if (client) return client;

  if (usingR2) {
    client = new S3Client({
      // R2 has no regions; "auto" is what Cloudflare documents.
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_KEY, secretAccessKey: R2_SECRET },
      // Recent SDKs add checksum headers that R2 rejects with a 400.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
    return client;
  }

  // Explicit keys win when set; otherwise the SDK's default chain picks up the
  // EC2 instance role in production.
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  client = new S3Client({
    region: S3_REGION,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
  return client;
}

/** Filesystem-safe name that still hints at the original. */
function safeName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.slice(-80) || "file";
}

export interface StoredObject {
  key: string;
  /** "r2" or "s3" — makes a silent fallback obvious in the response. */
  provider: string;
  /**
   * The link that travels with the cart and the order. Either a public bucket
   * URL, or this site's /api/files route, which re-signs on every request —
   * a raw presigned URL would expire long before some orders are printed.
   */
  url: string;
  /** Where the object actually lives, for admin tooling. */
  storageUrl: string;
  contentType: string;
  size: number;
  originalName: string;
}

export async function putObject(
  file: File,
  prefix: string
): Promise<StoredObject> {
  const key = `${prefix.replace(/^\/|\/$/g, "")}/${randomUUID()}-${safeName(file.name)}`;
  const contentType = file.type || "application/octet-stream";
  const body = Buffer.from(await file.arrayBuffer());

  await storageClient().send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Artwork is immutable once uploaded; each edit writes a new key.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const storageUrl = usingR2
    ? `${R2_ENDPOINT}/${STORAGE_BUCKET}/${encodedKey}`
    : `https://${STORAGE_BUCKET}.s3.${S3_REGION}.amazonaws.com/${encodedKey}`;

  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!PUBLIC_BASE_URL && /\/api(\/|$)/.test(siteBase)) {
    // A common slip is pasting the API base here; the links it builds then
    // point at the API host and 404 for everyone.
    console.warn(
      `[storage] NEXT_PUBLIC_SITE_URL looks like an API URL (${siteBase}). ` +
        "It should be the storefront's own origin, e.g. https://modfirst.com."
    );
  }
  const url = PUBLIC_BASE_URL
    ? `${PUBLIC_BASE_URL}/${encodedKey}`
    : `${siteBase}/api/files/${encodedKey}`;

  return {
    key,
    provider: STORAGE_PROVIDER,
    url,
    storageUrl,
    contentType,
    size: body.byteLength,
    originalName: file.name,
  };
}
