import { NextRequest } from "next/server";
import { proxyAuthGet } from "@/lib/api-proxy";

export async function GET(req: NextRequest) {
  const deliveryType = req.nextUrl.searchParams.get("delivery_type") ?? "home_delivery";
  return proxyAuthGet(
    req,
    `promotions/checkout?delivery_type=${encodeURIComponent(deliveryType)}`
  );
}
