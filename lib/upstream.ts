export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

export const API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY ?? "",
  "x-api-password": process.env.NEXT_PUBLIC_X_API_PASSWORD ?? "",
};

/**
 * Upstream headers for a request, forwarding the caller's customer bearer
 * token when one is present. Auth-gated endpoints (cart, orders, addresses)
 * need it; public ones ignore it.
 */
export function upstreamHeaders(authorization?: string | null) {
  return authorization
    ? { ...API_HEADERS, Authorization: authorization }
    : API_HEADERS;
}
