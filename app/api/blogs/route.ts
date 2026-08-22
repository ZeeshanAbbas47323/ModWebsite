import { NextRequest, NextResponse } from "next/server";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY ?? "",
  "x-api-password": process.env.NEXT_PUBLIC_X_API_PASSWORD ?? "",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const url = `${API_BASE}/blogs/frontend`;
    console.log("[/api/blogs] Calling:", url);
    console.log("[/api/blogs] API_BASE:", API_BASE);
    console.log("[/api/blogs] KEY present:", !!process.env.NEXT_PUBLIC_X_API_KEY);

    const res = await fetch(url, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify(body),
    });

    console.log("[/api/blogs] Upstream status:", res.status);

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[/api/blogs] Non-JSON response:", text.slice(0, 500));
      return NextResponse.json(
        { success: false, message: "Upstream returned invalid JSON", debug: text.slice(0, 200) },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/blogs] Error:", message);
    return NextResponse.json(
      { success: false, message, debug: "Check server terminal for full error" },
      { status: 500 }
    );
  }
}
