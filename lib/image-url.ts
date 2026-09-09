export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .replace(/\/api\/.*$/, "")
  .replace(/\/$/, "");


export const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "").replace(/\/$/, "");


export const MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(
  /\/$/,
  ""
);



export const DEAD_DOMAINS: string[] = ["storage.modfirstapparel.com"];


export function isDeadDomain(url: string | null | undefined): boolean {
  if (!url) return false;
  return DEAD_DOMAINS.some((d) => url.includes(d));
}


function mediaUrl(path: string): string {


  const key = path.replace(/^\/+/, "").replace(/^(uploads?\/)+/, "");
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `/api/media/${encoded}`;
}

export function resolveImageUrl(url: string | null | undefined, fallback = ""): string {
  if (!url) return fallback;


  for (const dead of DEAD_DOMAINS) {
    if (url.includes(dead)) {
      try {
        return mediaUrl(new URL(url).pathname);
      } catch {
      }
    }
  }


  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/images/")) {
    return url;
  }





  if (IMAGE_BASE_URL) {
    const key = url.replace(/^\/+/, "").replace(/^(uploads?\/)+/, "");
    return `${IMAGE_BASE_URL}/${key}`;
  }

  return mediaUrl(url);
}
