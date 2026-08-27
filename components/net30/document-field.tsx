"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ACCEPTED_IMAGE_TYPES, uploadService } from "@/services/upload.service";

interface DocumentFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}

/**
 * Upload a document, or paste a link to one.
 *
 * The upload endpoint only accepts images, so PDFs have to be hosted elsewhere
 * and linked — both paths end up as a URL on the application.
 */
export function DocumentField({ id, label, hint, value, onChange }: DocumentFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadService.image(file, "net30");
      onChange(uploaded.absolute_url || uploaded.url);
      setFileName(uploaded.originalName || file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      // Allow re-picking the same file after a failure.
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="flex flex-col sm:flex-row gap-3">
        <label
          className={`inline-flex items-center justify-center h-12 px-5 rounded-xl border border-dashed border-gray-300 text-sm font-medium cursor-pointer shrink-0 transition-colors ${
            uploading ? "opacity-60 cursor-wait" : "hover:border-black hover:bg-black/5"
          }`}
        >
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleFile}
            disabled={uploading}
            className="sr-only"
          />
          {uploading ? "Uploading…" : "Choose image"}
        </label>

        <Input
          id={id}
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setFileName(null);
          }}
          placeholder="…or paste a link (PDF, Drive, Dropbox)"
          className="h-12 rounded-xl"
        />
      </div>

      {fileName && (
        <p className="text-xs text-green-700">Uploaded {fileName}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
