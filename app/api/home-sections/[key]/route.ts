import { NextRequest, NextResponse } from "next/server";
import { API_BASE, API_HEADERS } from "@/lib/upstream";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const url = `${API_BASE}/home-sections/frontend/${encodeURIComponent(key)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: API_HEADERS,
      next: { revalidate: 60 },
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[/api/home-sections] Non-JSON:", text.slice(0, 300));
      return NextResponse.json(
        { success: false, message: "Upstream returned invalid JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/home-sections] Error:", message);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
