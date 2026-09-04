import apiClient from "@/lib/axios";

export interface UploadedFile {
  url: string;
  absolute_url: string;
  filename: string;
  size: number;
  originalName: string;
}

/** What the upstream image endpoint accepts — PDFs are not supported. */
export const ACCEPTED_IMAGE_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

export interface StoredUpload {
  /** Path the API reports, e.g. /product/foo-123.png */
  key: string;
  /** Permanent public link — safe to store on a cart item or order. */
  url: string;
  contentType: string;
  size: number;
  originalName: string;
}

/** Folder the upload endpoint files product artwork under. */
export const PRODUCT_UPLOAD_FOLDER = "product";

export const uploadService = {
  /**
   * Upload artwork for a product. This goes to the ModFirst upload endpoint,
   * which stores the file on the media CDN and returns a permanent URL — no
   * presigning, no expiry.
   */
  toStorage: async (
    file: File,
    folder: string = PRODUCT_UPLOAD_FOLDER
  ): Promise<StoredUpload> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    const payload: Partial<UploadedFile> = data?.payload ?? data?.data ?? {};
    if (!res.ok || !data?.success || !payload.absolute_url) {
      throw new Error(data?.message ?? "Could not upload that file.");
    }
    return {
      key: payload.url ?? "",
      url: payload.absolute_url,
      contentType: file.type,
      size: payload.size ?? file.size,
      originalName: payload.originalName || file.name,
    };
  },

  image: async (file: File, folder: string): Promise<UploadedFile> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post(
      `/upload?folder=${encodeURIComponent(folder)}`,
      form,
      // Let the browser set the multipart boundary.
      { headers: { "Content-Type": undefined } }
    );
    return data.payload ?? data.data ?? data;
  },
};
