import { NextResponse } from "next/server";
import { API_BASE, API_HEADERS } from "@/lib/upstream";

export async function GET() {
  try {
    const url = `${API_BASE}/footer-sections/frontend`;

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
      return NextResponse.json(
        { success: false, message: "Upstream returned invalid JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
