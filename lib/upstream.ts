export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

export const API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY ?? "",
  "x-api-password": process.env.NEXT_PUBLIC_X_API_PASSWORD ?? "",
};
