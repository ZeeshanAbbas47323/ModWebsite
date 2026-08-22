import { NextRequest, NextResponse } from "next/server";
import { API_BASE, API_HEADERS } from "@/lib/upstream";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_BASE}/products/get/${id}`, {
      method: "GET",
      headers: API_HEADERS,
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
