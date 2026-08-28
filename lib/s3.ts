import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const S3_BUCKET = process.env.AWS_BUCKET_NAME ?? "";
export const S3_REGION = process.env.AWS_REGION ?? "us-east-1";
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

export function isS3Configured() {
  return Boolean(S3_BUCKET);
}

let client: S3Client | null = null;

/**
 * Explicit keys win when they are set; otherwise the SDK falls back to its
 * default chain, which picks up the EC2 instance role in production.
 */
export function s3Client(): S3Client {
  if (client) return client;
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
  /**
   * Durable link that orders keep. It points at this site, which redirects to
   * a freshly signed S3 URL — the raw bucket URL is private and a presigned
   * one would expire long before the order ships.
   */
  url: string;
  /**
   * Raw bucket location. Not fetchable on its own — the bucket is private —
   * but useful for admin tooling that signs its own requests.
   */
  s3Url: string;
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

  await s3Client().send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Artwork is immutable once uploaded; each edit writes a new key.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const s3Url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${encodedKey}`;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const url = `${base}/api/files/${encodedKey}`;

  return {
    key,
    url,
    s3Url,
    contentType,
    size: body.byteLength,
    originalName: file.name,
  };
}
