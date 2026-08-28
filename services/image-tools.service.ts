/** ClipDrop will not upscale beyond this on either side. */
export const MAX_UPSCALE_SIDE = 4096;

/** Natural pixel size of an image file. */
export function readImageSize(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}

/** Turn an API response into a File the tool can keep using. */
async function toFile(res: Response, name: string): Promise<File> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Image service returned ${res.status}.`);
  }
  const blob = await res.blob();
  const type = blob.type || "image/png";
  const ext = type.includes("jpeg") ? "jpg" : "png";
  const base = name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.${ext}`, { type });
}

export const imageToolsService = {
  removeBackground: async (file: File): Promise<File> => {
    const form = new FormData();
    form.append("image_file", file);
    const res = await fetch("/api/image/remove-background", {
      method: "POST",
      body: form,
    });
    return toFile(res, `${file.name.replace(/\.[^.]+$/, "")}-no-bg`);
  },

  upscale: async (file: File, scale = 2): Promise<File> => {
    // The API stretches to whatever dimensions it is given, so the target has
    // to keep the source's aspect ratio or the artwork comes back distorted.
    const { width, height } = await readImageSize(file);
    const capped = Math.min(scale, MAX_UPSCALE_SIDE / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * capped));
    const targetHeight = Math.max(1, Math.round(height * capped));

    const form = new FormData();
    form.append("image_file", file);
    form.append("target_width", String(targetWidth));
    form.append("target_height", String(targetHeight));
    const res = await fetch("/api/image/upscale", { method: "POST", body: form });
    return toFile(res, `${file.name.replace(/\.[^.]+$/, "")}-upscaled`);
  },
};

export interface CropRect {
  /** Fractions of the source image, 0–1. */
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crop in the browser — no round trip needed, and it keeps the full resolution
 * of the source rather than the on-screen preview size.
 */
export function cropImageFile(file: File, rect: CropRect): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      const sx = Math.round(rect.x * image.naturalWidth);
      const sy = Math.round(rect.y * image.naturalHeight);
      const sw = Math.max(1, Math.round(rect.width * image.naturalWidth));
      const sh = Math.max(1, Math.round(rect.height * image.naturalHeight));

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not crop this image."));
        return;
      }
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not crop this image."));
          return;
        }
        const base = file.name.replace(/\.[^.]+$/, "");
        resolve(new File([blob], `${base}-cropped.png`, { type: "image/png" }));
        // PNG keeps any transparency a background removal produced.
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}
