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

export const uploadService = {
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
