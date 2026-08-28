import { NextRequest } from "next/server";
import { proxyClipdrop } from "@/lib/clipdrop";

/** ClipDrop caps upscaling at 4096 px per side. */
const MAX_SIDE = 4096;

function side(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(MAX_SIDE, Math.round(n));
}

export async function POST(req: NextRequest) {
  return proxyClipdrop(req, "image-upscaling/v1/upscale", (form, incoming) => {
    form.append("target_width", String(side(incoming.get("target_width"), 2048)));
    form.append("target_height", String(side(incoming.get("target_height"), 2048)));
  });
}
