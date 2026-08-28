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
  key: string;
  /** Durable link — safe to store on an order. */
  url: string;
  s3Url: string;
  contentType: string;
  size: number;
  originalName: string;
}

export const uploadService = {
  /** Put a file in the project's S3 bucket. */
  toS3: async (file: File, prefix: string): Promise<StoredUpload> => {
    const form = new FormData();
    form.append("file", file);
    form.append("prefix", prefix);
    const res = await fetch("/api/upload/s3", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message ?? "Could not upload that file.");
    }
    return data.payload as StoredUpload;
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
