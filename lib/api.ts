const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key":  process.env.NEXT_PUBLIC_X_API_KEY!,
  "x-api-password":  process.env.NEXT_PUBLIC_X_API_PASSWORD!,
};

export async function apiFetch(path: string, options?: RequestInit) {
  const base = API_BASE_URL?.replace(/\/$/, "");
  const res = await fetch(`${base}/${path}`, {
    ...options,
    headers: {
      ...API_HEADERS,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
