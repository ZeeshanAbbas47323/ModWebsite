import { NextResponse } from "next/server";
import { BUILDER_ORIGIN } from "@/lib/gang-sheet";


export async function GET() {
  try {



    const res = await fetch(`${BUILDER_ORIGIN}/api/v1/gang-sheet/products`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json({ products: data.products ?? [] });
  } catch {

    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
