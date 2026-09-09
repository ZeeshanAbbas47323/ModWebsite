import apiClient from "@/lib/axios";

export interface UploadedFile {
  url: string;
  absolute_url: string;
  filename: string;
  size: number;
  originalName: string;
}


export const ACCEPTED_IMAGE_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

export interface StoredUpload {

  key: string;

  url: string;
  contentType: string;
  size: number;
  originalName: string;
}


export const PRODUCT_UPLOAD_FOLDER = "product";


export const ACCEPTED_VIDEO_TYPES = "video/mp4,video/quicktime,video/webm";

export const uploadService = {

  toStorage: async (
    file: File,
    folder: string = PRODUCT_UPLOAD_FOLDER,
    kind: "image" | "video" = "image"
  ): Promise<StoredUpload> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `/api/upload?folder=${encodeURIComponent(folder)}&type=${kind}`,
      { method: "POST", body: form }
    );
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

      { headers: { "Content-Type": undefined } }
    );
    return data.payload ?? data.data ?? data;
  },
};
