import { NextRequest, NextResponse } from "next/server";
import { isStorageConfigured, putObject } from "@/lib/storage";

/** Where artwork for this tool lives in the bucket. */
const DEFAULT_PREFIX = "storefront-uploads";
const MAX_BYTES = 100 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { success: false, message: "Storage is not configured." },
      { status: 501 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file was uploaded." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "That file is over 100 MB." },
        { status: 413 }
      );
    }

    const prefix = String(form.get("prefix") || DEFAULT_PREFIX);
    const stored = await putObject(file, prefix);

    return NextResponse.json({ success: true, payload: stored });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
