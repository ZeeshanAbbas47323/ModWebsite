import { NextRequest } from "next/server";
import { proxyAuthGet } from "@/lib/api-proxy";

export async function GET(req: NextRequest) {
  return proxyAuthGet(req, "promotions/checkout");
}
