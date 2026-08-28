import { NextRequest, NextResponse } from "next/server";

const CLIPDROP_BASE = "https://clipdrop-api.co";

/**
 * Forward an image-editing request to ClipDrop.
 *
 * The key is server-only on purpose: shipping it to the browser would let any
 * visitor spend the account's credits.
 */
export async function proxyClipdrop(
  req: NextRequest,
  path: string,
  extraFields?: (form: FormData, incoming: FormData) => void
) {
  const key = process.env.CLIPDROP_API_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, message: "Image editing is not configured." },
      { status: 501 }
    );
  }

  try {
    const incoming = await req.formData();
    const image = incoming.get("image_file");
    if (!(image instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No image was uploaded." },
        { status: 400 }
      );
    }

    const form = new FormData();
    form.append("image_file", image, image.name || "image.png");
    extraFields?.(form, incoming);

    const res = await fetch(`${CLIPDROP_BASE}/${path}`, {
      method: "POST",
      headers: { "x-api-key": key },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      // ClipDrop reports failures as JSON; surface its message, not the bytes.
      const detail = await res.text().catch(() => "");
      let message = `Image service returned ${res.status}.`;
      try {
        const parsed = JSON.parse(detail);
        message = parsed.error ?? parsed.message ?? message;
      } catch {
        if (detail) message = detail.slice(0, 200);
      }
      return NextResponse.json({ success: false, message }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/png",
        "Cache-Control": "no-store",
        // Lets the UI show how many credits are left.
        "x-remaining-credits": res.headers.get("x-remaining-credits") ?? "",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
