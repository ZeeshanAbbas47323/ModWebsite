import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PRESIGN_TTL, S3_BUCKET, isS3Configured, s3Client } from "@/lib/s3";

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
  if (!isS3Configured()) {
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

  try {
    const signed = await getSignedUrl(
      s3Client(),
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
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
