import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/api-proxy";

export async function DELETE(req: NextRequest) {
  return proxyDelete(req, "common/frontend/delete");
}
