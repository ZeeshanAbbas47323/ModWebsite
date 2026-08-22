import type { Blog } from "./blog.service";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY!,
  "x-api-password": process.env.NEXT_PUBLIC_X_API_PASSWORD!,
};

export async function getBlogBySlug(slug: string): Promise<Blog> {
  const res = await fetch(`${API_BASE}/blogs/frontend/${slug}`, {
    headers: API_HEADERS,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Blog not found: ${slug}`);
  const data = await res.json();
  return data.payload;
}
