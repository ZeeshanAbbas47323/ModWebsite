import { NextRequest } from "next/server";
import { proxyClipdrop } from "@/lib/clipdrop";

export async function POST(req: NextRequest) {
  return proxyClipdrop(req, "remove-background/v1");
}
