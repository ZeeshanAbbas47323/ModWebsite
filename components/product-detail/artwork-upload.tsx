"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ARTWORK_ACCEPT,
  MAX_ARTWORK_BYTES,
  MAX_ARTWORK_FILES,
} from "@/lib/artwork-upload";
import { uploadService, type StoredUpload } from "@/services/upload.service";

export interface ArtworkFile {
  id: string;
  name: string;
  previewUrl: string | null;
  stored: StoredUpload | null;
  error: string | null;
}

interface ArtworkUploadProps {
  files: ArtworkFile[];
  onChange: (files: ArtworkFile[]) => void;
}

let seq = 0;

/** Lets the customer attach print-ready files to an ordinary product. */
export function ArtworkUpload({ files, onChange }: ArtworkUploadProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const accept = async (incoming: FileList | File[] | null | undefined) => {
    const picked = Array.from(incoming ?? []);
    if (picked.length === 0) return;

    const room = MAX_ARTWORK_FILES - files.length;
    const tooBig = picked.filter((f) => f.size > MAX_ARTWORK_BYTES);
    const usable = picked.filter((f) => f.size <= MAX_ARTWORK_BYTES).slice(0, room);

    setNotice(
      tooBig.length
        ? `${tooBig.length} file(s) are over 100 MB and were skipped.`
        : picked.length > room
          ? `Only ${MAX_ARTWORK_FILES} files can be attached.`
          : null
    );
    if (usable.length === 0) return;

    const added: ArtworkFile[] = usable.map((file) => {
      seq += 1;
      return {
        id: `art-${seq}-${Date.now()}`,
        name: file.name,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        stored: null,
        error: null,
      };
    });

    // Show the rows immediately; each upload fills its own row in.
    let working = [...files, ...added];
    onChange(working);

    await Promise.all(
      usable.map(async (file, index) => {
        const id = added[index].id;
        try {
          const stored = await uploadService.toStorage(file, "artwork");
          working = working.map((f) => (f.id === id ? { ...f, stored } : f));
        } catch (err) {
          working = working.map((f) =>
            f.id === id
              ? { ...f, error: err instanceof Error ? err.message : "Upload failed." }
              : f
          );
        }
        onChange(working);
      })
    );
  };

  const remove = (id: string) => {
    const going = files.find((f) => f.id === id);
    if (going?.previewUrl) URL.revokeObjectURL(going.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-bold text-black mb-1">Your artwork</p>
      <p className="text-xs text-gray-500 mb-3">
        Upload the print-ready file(s) you want us to print.
      </p>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void accept(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-gray-300 bg-[#F4F4F5] py-7 px-4 cursor-pointer hover:border-black transition-colors text-center"
      >
        <input
          type="file"
          multiple
          accept={ARTWORK_ACCEPT}
          onChange={(e) => {
            void accept(e.target.files);
            // Allow re-picking the same file after removing it.
            e.target.value = "";
          }}
          className="sr-only"
        />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gray-500">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M17 8l-5-5-5 5" />
          <path d="M12 3v12" />
        </svg>
        <span className="text-sm text-black font-medium">Drag &amp; drop or browse</span>
        <span className="text-[11px] text-gray-500">
          PNG · JPG · WEBP · up to {MAX_ARTWORK_FILES} files · max 100 MB each
        </span>
      </label>

      {notice && <p className="text-xs text-orange-600 mt-2">{notice}</p>}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-3">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 bg-[#F4F4F5] rounded-xl px-3 py-2"
            >
              <span className="w-10 h-10 shrink-0 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                {file.previewUrl ? (
                  // A local blob URL — next/image would add nothing here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.previewUrl} alt="" className="max-w-full max-h-full object-contain" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gray-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                )}
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm text-black truncate">{file.name}</span>
                <span
                  className={cn(
                    "block text-[11px]",
                    file.error ? "text-red-600" : file.stored ? "text-green-700" : "text-gray-500"
                  )}
                >
                  {file.error ?? (file.stored ? "Uploaded" : "Uploading…")}
                </span>
              </span>

              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => remove(file.id)}
                className="shrink-0 w-7 h-7 rounded-full text-gray-500 hover:bg-black/10 hover:text-black transition-colors"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
