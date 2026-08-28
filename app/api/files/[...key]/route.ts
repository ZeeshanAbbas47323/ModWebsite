import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  LEGACY_BUCKET,
  PRESIGN_TTL,
  PUBLIC_BASE_URL,
  STORAGE_BUCKET,
  isStorageConfigured,
  legacyClient,
  storageClient,
} from "@/lib/storage";

/** Only artwork prefixes are reachable through this route. */
const ALLOWED_PREFIXES = [
  "artwork/",
  "transfers-by-size/",
  "storefront-uploads/",
  "gang-sheets/",
];

/**
 * Stable link to a stored object.
 *
 * The bucket is private and presigned URLs expire, so orders keep a link to
 * this route instead. Each request mints a fresh presigned URL and redirects,
 * which means an order placed weeks ago still opens.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { success: false, message: "Storage is not configured." },
      { status: 501 }
    );
  }

  const { key: segments } = await params;
  const key = segments.map(decodeURIComponent).join("/");

  // Keys carry a UUID, so they are unguessable, but keep the blast radius to
  // the artwork prefixes rather than the whole bucket.
  if (key.includes("..") || !ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
    return NextResponse.json(
      { success: false, message: "Not found." },
      { status: 404 }
    );
  }

  // A public bucket needs no signature; send the caller straight there.
  if (PUBLIC_BASE_URL) {
    const target = `${PUBLIC_BASE_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;
    return NextResponse.redirect(target, { status: 307 });
  }

  try {
    // Artwork uploaded before the move to R2 lives in the old AWS bucket, so
    // fall back to it when the object is not in the current one.
    let bucket = STORAGE_BUCKET;
    let client = storageClient();

    const legacy = legacyClient();
    if (legacy) {
      const inCurrent = await client
        .send(new HeadObjectCommand({ Bucket: STORAGE_BUCKET, Key: key }))
        .then(() => true)
        .catch(() => false);
      if (!inCurrent) {
        bucket = LEGACY_BUCKET;
        client = legacy;
      }
    }

    const signed = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: PRESIGN_TTL }
    );
    return NextResponse.redirect(signed, {
      status: 307,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
