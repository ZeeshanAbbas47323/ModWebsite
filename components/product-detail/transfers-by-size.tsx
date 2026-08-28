"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CropDialog } from "@/components/product-detail/crop-dialog";
import {
  cropImageFile,
  imageToolsService,
  readImageSize,
  type CropRect,
} from "@/services/image-tools.service";
import { uploadService, type StoredUpload } from "@/services/upload.service";
import {
  ACCEPTED_UPLOAD,
  GOOD_DPI,
  MAX_HEIGHT_IN,
  MAX_NOTES,
  MAX_UPLOAD_BYTES,
  MAX_WIDTH_IN,
  MIN_SIDE_IN,
  PREVIEW_BACKGROUNDS,
  RUSH_ORDER_FEE,
  SIZE_PRESETS,
  clamp,
  nextQuantityBreak,
  priceTransfer,
} from "@/lib/transfers-by-size";

export interface TransferSelection {
  file: File | null;
  /** Already-stored copy, so the caller does not upload again. */
  stored?: StoredUpload | null;
  widthIn: number;
  heightIn: number;
  quantity: number;
  rushOrder: boolean;
  notes: string;
  unitPrice: number;
  totalPrice: number;
}

/** One uploaded artwork with its own size, quantity and edit history. */
interface Design {
  id: string;
  file: File;
  widthIn: number;
  heightIn: number;
  keepRatio: boolean;
  ratio: number;
  quantity: number;
  rushOrder: boolean;
  notes: string;
  naturalWidth: number | null;
  /** Previous versions, so each design can be undone independently. */
  history: File[];
  /** Blob URL for the preview, created once per file version. */
  previewUrl: string | null;
  /** Where this exact version lives in storage. */
  remote: StoredUpload | null;
  uploading: boolean;
  uploadError: string | null;
}

let designSeq = 0;

function newDesign(file: File): Design {
  designSeq += 1;
  return {
    id: `design-${designSeq}-${Date.now()}`,
    file,
    previewUrl: isPreviewable(file) ? URL.createObjectURL(file) : null,
    widthIn: 4,
    heightIn: 3,
    keepRatio: true,
    ratio: 4 / 3,
    quantity: 1,
    rushOrder: false,
    notes: "",
    naturalWidth: null,
    history: [],
    remote: null,
    uploading: true,
    uploadError: null,
  };
}

interface TransfersBySizeProps {
  onAddToCart: (selection: TransferSelection) => Promise<void>;
}

const money = (n: number) => `$${n.toFixed(2)}`;

/** Vector and PDF artwork cannot be previewed in the browser. */
function isPreviewable(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}

export function TransfersBySize({ onAddToCart }: TransfersBySizeProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [background, setBackground] = useState<string>("transparent");

  const [busyTool, setBusyTool] = useState<"bg" | "upscale" | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const active = designs.find((d) => d.id === activeId) ?? null;

  // Blob URLs are minted in the handlers that create each file version, so the
  // only cleanup left is releasing whatever is still open when the tool closes.
  const liveDesigns = useRef<Design[]>([]);
  useEffect(() => {
    liveDesigns.current = designs;
  }, [designs]);
  useEffect(
    () => () => {
      for (const design of liveDesigns.current) {
        if (design.previewUrl) URL.revokeObjectURL(design.previewUrl);
      }
    },
    []
  );

  const patchDesign = (id: string, patch: Partial<Design>) =>
    setDesigns((list) => {
      const current = list.find((d) => d.id === id);
      if (!current) return list;
      // Returning the same array when nothing moved stops needless re-renders.
      const changed = (Object.keys(patch) as (keyof Design)[]).some(
        (key) => current[key] !== patch[key]
      );
      if (!changed) return list;
      return list.map((d) => (d.id === id ? { ...d, ...patch } : d));
    });

  /** Every version of an artwork gets its own object in storage. */
  const storeFile = async (id: string, file: File) => {
    // Reading the pixel size here keeps it out of the preview's onLoad, which
    // would otherwise feed state changes straight back into the preview.
    readImageSize(file)
      .then(({ width }) => patchDesign(id, { naturalWidth: width }))
      .catch(() => patchDesign(id, { naturalWidth: null }));

    patchDesign(id, { uploading: true, uploadError: null });
    try {
      const stored = await uploadService.toStorage(file, "transfers-by-size");
      patchDesign(id, { remote: stored, uploading: false });
    } catch (err) {
      patchDesign(id, {
        uploading: false,
        uploadError: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  };

  const patchActive = (patch: Partial<Design>) => {
    if (activeId) patchDesign(activeId, patch);
  };

  const acceptFiles = (incoming: FileList | File[] | null | undefined) => {
    const files = Array.from(incoming ?? []);
    if (files.length === 0) return;

    const tooBig = files.filter((f) => f.size > MAX_UPLOAD_BYTES);
    const usable = files.filter((f) => f.size <= MAX_UPLOAD_BYTES);

    setMessage(
      tooBig.length
        ? { tone: "error", text: `${tooBig.length} file(s) are over 100 MB and were skipped.` }
        : null
    );
    if (usable.length === 0) return;

    const added = usable.map(newDesign);
    setDesigns((list) => [...list, ...added]);
    setActiveId((current) => current ?? added[0].id);
    // Store each one straight away, so the URL is ready before checkout.
    added.forEach((design) => void storeFile(design.id, design.file));
  };

  const removeDesign = (id: string) => {
    const going = designs.find((d) => d.id === id);
    if (going?.previewUrl) URL.revokeObjectURL(going.previewUrl);
    setDesigns((list) => {
      const next = list.filter((d) => d.id !== id);
      setActiveId((current) => (current === id ? next[0]?.id ?? null : current));
      return next;
    });
  };

  /** Replace the active artwork, keeping the previous one for undo. */
  const applyEdit = (edited: File) => {
    if (!active) return;
    if (active.previewUrl) URL.revokeObjectURL(active.previewUrl);
    patchActive({
      file: edited,
      previewUrl: isPreviewable(edited) ? URL.createObjectURL(edited) : null,
      history: [...active.history, active.file],
      naturalWidth: null,
      remote: null,
    });
    // An edit is a different image, so it needs its own stored copy and URL.
    void storeFile(active.id, edited);
  };

  const undoEdit = () => {
    if (!active || active.history.length === 0) return;
    const previous = active.history[active.history.length - 1];
    if (active.previewUrl) URL.revokeObjectURL(active.previewUrl);
    patchActive({
      file: previous,
      previewUrl: isPreviewable(previous) ? URL.createObjectURL(previous) : null,
      history: active.history.slice(0, -1),
      naturalWidth: null,
      remote: null,
    });
    void storeFile(active.id, previous);
  };

  const runTool = async (tool: "bg" | "upscale") => {
    if (!active) return;
    if (!isPreviewable(active.file)) {
      setMessage({ tone: "error", text: "These tools work on PNG, JPG and WEBP artwork." });
      return;
    }
    setMessage(null);
    setBusyTool(tool);
    try {
      const wasTransparent = active.file.type === "image/png";
      const edited =
        tool === "bg"
          ? await imageToolsService.removeBackground(active.file)
          : await imageToolsService.upscale(active.file);
      applyEdit(edited);

      // Upscaling comes back as JPEG, which cannot carry an alpha channel.
      const lostTransparency =
        tool === "upscale" && wasTransparent && edited.type !== "image/png";

      setMessage(
        lostTransparency
          ? {
              tone: "error",
              text: "Upscaled — but the transparent background was flattened. Undo, then upscale before removing the background.",
            }
          : {
              tone: "success",
              text: tool === "bg" ? "Background removed." : "Artwork upscaled.",
            }
      );
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "That did not work." });
    } finally {
      setBusyTool(null);
    }
  };

  const applyCrop = async (rect: CropRect) => {
    if (!active) return;
    setCropOpen(false);
    try {
      applyEdit(await cropImageFile(active.file, rect));
      setMessage({ tone: "success", text: "Cropped." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not crop that image." });
    }
  };

  const setWidth = (value: number) => {
    if (!active) return;
    const w = clamp(value, MIN_SIDE_IN, MAX_WIDTH_IN);
    const h =
      active.keepRatio && active.ratio > 0
        ? clamp(+(w / active.ratio).toFixed(2), MIN_SIDE_IN, MAX_HEIGHT_IN)
        : active.heightIn;
    patchActive({ widthIn: w, heightIn: h });
  };

  const setHeight = (value: number) => {
    if (!active) return;
    const h = clamp(value, MIN_SIDE_IN, MAX_HEIGHT_IN);
    const w =
      active.keepRatio && active.ratio > 0
        ? clamp(+(h * active.ratio).toFixed(2), MIN_SIDE_IN, MAX_WIDTH_IN)
        : active.widthIn;
    patchActive({ widthIn: w, heightIn: h });
  };

  const applyPreset = (w: number, h: number) =>
    patchActive({ widthIn: w, heightIn: h, ratio: w / h });

  // Every design is priced on its own, then summed.
  const lines = designs.map((design) => ({
    design,
    pricing: priceTransfer(design.widthIn, design.heightIn, design.quantity, design.rushOrder),
  }));
  const grandTotal = lines.reduce((sum, line) => sum + line.pricing.total, 0);

  const pricing = active
    ? priceTransfer(active.widthIn, active.heightIn, active.quantity, active.rushOrder)
    : null;

  const dpi =
    active?.naturalWidth && active.widthIn > 0
      ? Math.round(active.naturalWidth / active.widthIn)
      : null;
  const upcoming = active ? nextQuantityBreak(active.quantity) : null;

  const handleAdd = async () => {
    if (designs.length === 0) {
      setMessage({ tone: "error", text: "Upload your design first." });
      return;
    }
    if (designs.some((d) => d.uploading)) {
      setMessage({ tone: "error", text: "Still uploading — one moment." });
      return;
    }
    const failed = designs.filter((d) => !d.remote);
    if (failed.length > 0) {
      setMessage({
        tone: "error",
        text: `${failed.length} design(s) did not upload. Remove or re-add them.`,
      });
      return;
    }
    setMessage(null);
    setAdding(true);
    try {
      // Sequential, so a mid-way failure leaves earlier lines in the cart
      // rather than firing every upload at once.
      for (const { design, pricing: linePricing } of lines) {
        await onAddToCart({
          file: design.file,
          stored: design.remote,
          widthIn: design.widthIn,
          heightIn: design.heightIn,
          quantity: design.quantity,
          rushOrder: design.rushOrder,
          notes: design.notes.trim(),
          unitPrice: linePricing.discountedUnit,
          totalPrice: linePricing.total,
        });
      }
      for (const { design } of lines) {
        if (design.previewUrl) URL.revokeObjectURL(design.previewUrl);
      }
      setDesigns([]);
      setActiveId(null);
      setMessage({ tone: "success", text: "Added to cart." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Could not add to cart." });
    } finally {
      setAdding(false);
    }
  };

  const isCheckerboard = background === "transparent";
  const activePreview = active?.previewUrl ?? null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Preview */}
      <div className="w-full lg:w-1/2">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Preview</p>

        <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-10 flex flex-col items-center">
          {active ? (
            <div className="flex items-end gap-3">
              <span className="text-xs font-bold text-primary [writing-mode:vertical-rl] rotate-180 tabular-nums">
                {active.heightIn.toFixed(2)} in
              </span>

              <div className="flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-primary tabular-nums">
                  {active.widthIn.toFixed(2)} in
                </span>
                <div
                  className="border border-gray-300 flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${clamp((active.widthIn / MAX_WIDTH_IN) * 240, 60, 240)}px`,
                    aspectRatio: `${active.widthIn} / ${active.heightIn}`,
                    maxHeight: "300px",
                    background: isCheckerboard ? undefined : background,
                    backgroundImage: isCheckerboard
                      ? "linear-gradient(45deg,#d9d9d9 25%,transparent 25%),linear-gradient(-45deg,#d9d9d9 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d9d9d9 75%),linear-gradient(-45deg,transparent 75%,#d9d9d9 75%)"
                      : undefined,
                    backgroundSize: isCheckerboard ? "16px 16px" : undefined,
                    backgroundPosition: isCheckerboard ? "0 0,0 8px,8px -8px,-8px 0px" : undefined,
                  }}
                >
                  {activePreview ? (
                    // Object URLs are local blobs, so next/image adds nothing here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activePreview}
                      alt={active.file.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500 p-4 text-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <span className="text-xs break-all">{active.file.name}</span>
                      <span className="text-[11px]">Preview not available for this format</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-500">
              Upload a design to see it here
            </div>
          )}

          <div className="flex items-center gap-3 mt-8">
            <span className="text-xs text-gray-500">Background</span>
            {PREVIEW_BACKGROUNDS.map((bg) => (
              <button
                key={bg.value}
                type="button"
                aria-label={bg.label}
                aria-pressed={background === bg.value}
                onClick={() => setBackground(bg.value)}
                className={cn(
                  "w-6 h-6 rounded-full border transition-all",
                  background === bg.value
                    ? "border-black ring-2 ring-black ring-offset-2"
                    : "border-gray-300 hover:border-black"
                )}
                style={
                  bg.value === "transparent"
                    ? {
                        backgroundImage:
                          "linear-gradient(45deg,#c9c9c9 25%,transparent 25%),linear-gradient(-45deg,#c9c9c9 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#c9c9c9 75%),linear-gradient(-45deg,transparent 75%,#c9c9c9 75%)",
                        backgroundSize: "8px 8px",
                        backgroundPosition: "0 0,0 4px,4px -4px,-4px 0px",
                      }
                    : { backgroundColor: bg.value }
                }
              />
            ))}
          </div>
        </div>

        {/* Designs in this order */}
        {designs.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Designs ({designs.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {lines.map(({ design, pricing: linePricing }) => (
                <div key={design.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveId(design.id)}
                    aria-pressed={design.id === activeId}
                    title={design.file.name}
                    className={cn(
                      "w-20 rounded-xl border-2 overflow-hidden bg-white transition-colors",
                      design.id === activeId
                        ? "border-black"
                        : "border-transparent hover:border-gray-300"
                    )}
                  >
                    <span className="block w-full h-16 flex items-center justify-center bg-[#F4F4F5]">
                      {design.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={design.previewUrl}
                          alt=""
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-500 px-1 break-all line-clamp-2">
                          {design.file.name}
                        </span>
                      )}
                    </span>
                    <span className="block text-[10px] py-1 tabular-nums">
                      {design.uploading ? (
                        <span className="text-gray-400">Uploading…</span>
                      ) : design.uploadError ? (
                        <span className="text-red-600">Upload failed</span>
                      ) : (
                        <span className="text-gray-600">
                          ×{design.quantity} · ${linePricing.total.toFixed(2)}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${design.file.name}`}
                    onClick={() => removeDesign(design.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full lg:w-1/2 flex flex-col gap-7">
        {/* Upload */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Upload design</p>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              acceptFiles(e.dataTransfer.files);
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-gray-300 bg-[#F4F4F5] py-8 px-4 cursor-pointer hover:border-black transition-colors text-center"
          >
            <input
              type="file"
              multiple
              accept={ACCEPTED_UPLOAD}
              onChange={(e) => {
                acceptFiles(e.target.files);
                // Allow picking the same file again after removing it.
                e.target.value = "";
              }}
              className="sr-only"
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gray-500">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
            <span className="text-sm text-black font-medium">
              Drag &amp; drop or browse
            </span>
            <span className="text-[11px] text-gray-500">
              PNG · JPG · WEBP · AI · EPS · PDF · max 100 MB · multiple files welcome
            </span>
          </label>

          {active && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => runTool("bg")}
                disabled={busyTool !== null}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-medium text-black hover:border-black transition-colors disabled:opacity-50"
              >
                {busyTool === "bg" ? "Removing…" : "Remove background"}
              </button>
              <button
                type="button"
                onClick={() => runTool("upscale")}
                disabled={busyTool !== null}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-medium text-black hover:border-black transition-colors disabled:opacity-50"
              >
                {busyTool === "upscale" ? "Upscaling…" : "Upscale"}
              </button>
              <button
                type="button"
                onClick={() => setCropOpen(true)}
                disabled={busyTool !== null || !isPreviewable(active.file)}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-medium text-black hover:border-black transition-colors disabled:opacity-50"
              >
                Crop
              </button>
              {active.history.length > 0 && (
                <button
                  type="button"
                  onClick={undoEdit}
                  disabled={busyTool !== null}
                  className="px-4 py-2 rounded-full text-xs font-medium text-gray-600 underline hover:text-black disabled:opacity-50"
                >
                  Undo
                </button>
              )}
            </div>
          )}

          {dpi != null && active && (
            <p className={cn("text-xs mt-2", dpi >= GOOD_DPI ? "text-green-700" : "text-orange-600")}>
              {dpi} DPI at {active.widthIn.toFixed(2)} in —{" "}
              {dpi >= GOOD_DPI ? "great for printing" : `below the ${GOOD_DPI} DPI we recommend`}
            </p>
          )}
        </div>

        {active && pricing ? (
          <>
            {designs.length > 1 && (
              <p className="text-xs text-gray-500 -mb-3 break-all">
                Editing <span className="font-bold text-black">{active.file.name}</span>
              </p>
            )}

            {/* Size */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Size</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {SIZE_PRESETS.map((preset) => {
                  const on = active.widthIn === preset.w && active.heightIn === preset.h;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset.w, preset.h)}
                      className={cn(
                        "px-4 py-1.5 rounded-full border text-xs font-medium transition-colors",
                        on
                          ? "bg-black text-white border-black"
                          : "bg-white text-[#464545] border-gray-300 hover:border-black"
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label htmlFor="tbs-w" className="text-xs text-gray-500">W</label>
                  <input
                    id="tbs-w"
                    type="number"
                    min={MIN_SIDE_IN}
                    max={MAX_WIDTH_IN}
                    step={0.1}
                    value={active.widthIn}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Max {MAX_WIDTH_IN} in</p>
                </div>
                <span className="text-gray-400 pb-9">×</span>
                <div className="flex-1">
                  <label htmlFor="tbs-h" className="text-xs text-gray-500">H</label>
                  <input
                    id="tbs-h"
                    type="number"
                    min={MIN_SIDE_IN}
                    max={MAX_HEIGHT_IN}
                    step={0.1}
                    value={active.heightIn}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Max {MAX_HEIGHT_IN} in</p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={active.keepRatio}
                  onChange={(e) =>
                    patchActive({
                      keepRatio: e.target.checked,
                      ratio: e.target.checked ? active.widthIn / active.heightIn : active.ratio,
                    })
                  }
                  className="w-4 h-4 accent-black"
                />
                Keep aspect ratio ({(active.widthIn / active.heightIn).toFixed(2)})
              </label>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Quantity</p>
              <div className="flex items-center gap-4 bg-[#F4F4F5] rounded-xl px-4 h-14 w-fit">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => patchActive({ quantity: Math.max(1, active.quantity - 1) })}
                  disabled={active.quantity <= 1}
                  className="text-2xl leading-none text-black disabled:opacity-40"
                >
                  &minus;
                </button>
                <input
                  type="number"
                  min={1}
                  aria-label="Quantity"
                  value={active.quantity}
                  onChange={(e) =>
                    patchActive({ quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)) })
                  }
                  className="w-16 bg-transparent text-center font-bold text-lg focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => patchActive({ quantity: active.quantity + 1 })}
                  className="text-2xl leading-none text-black"
                >
                  +
                </button>
              </div>
              {upcoming && (
                <p className="text-xs text-gray-600 mt-2">
                  Add {upcoming.minQty - active.quantity} more to save {upcoming.discountPct}%
                </p>
              )}
            </div>

            {/* Price */}
            <div className="bg-[#F4F4F5] rounded-[20px] p-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Unit price
                  {pricing.discountPct > 0 && (
                    <span className="text-green-700 font-medium"> (−{pricing.discountPct}%)</span>
                  )}
                </span>
                <span className="font-bold">
                  {pricing.discountPct > 0 && (
                    <span className="text-gray-400 line-through mr-2 font-normal">
                      {money(pricing.unitPrice)}
                    </span>
                  )}
                  {money(pricing.discountedUnit)} each
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">{money(pricing.subtotal)}</span>
              </div>
              {pricing.rushAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rush order</span>
                  <span className="font-bold">+{money(pricing.rushAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                <span className="font-bold text-black">
                  {designs.length > 1 ? "This design" : "Total"}
                </span>
                <span className="font-bold text-black text-lg">{money(pricing.total)}</span>
              </div>
              {designs.length > 1 && (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black">All {designs.length} designs</span>
                  <span className="font-bold text-black text-lg">{money(grandTotal)}</span>
                </div>
              )}
              <p className="text-[11px] text-gray-500">
                {pricing.areaSqIn.toFixed(2)} sq in per transfer
              </p>
            </div>

            {/* Rush */}
            <label className="flex items-center justify-between gap-4 bg-[#F4F4F5] rounded-[20px] px-5 py-4 cursor-pointer">
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={active.rushOrder}
                  onChange={(e) => patchActive({ rushOrder: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm font-medium text-black">Rush order</span>
              </span>
              <span className="text-sm font-bold text-primary">+{money(RUSH_ORDER_FEE)}</span>
            </label>

            {/* Notes */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                Special instructions
              </p>
              <textarea
                rows={4}
                value={active.notes}
                maxLength={MAX_NOTES}
                onChange={(e) => patchActive({ notes: e.target.value })}
                placeholder="Notes for this transfer…"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-black transition-colors resize-none text-base"
              />
              <p className="text-[11px] text-gray-500 text-right mt-1">
                {active.notes.length} / {MAX_NOTES}
              </p>
            </div>
          </>
        ) : null}

        {message && (
          <p className={cn("text-sm", message.tone === "error" ? "text-red-600" : "text-green-700")}>
            {message.text}
          </p>
        )}

        {active?.uploading && (
          <p className="text-xs text-gray-500">Saving this version to storage…</p>
        )}
        {active?.uploadError && (
          <p className="text-xs text-red-600">{active.uploadError}</p>
        )}

        <Button
          size="xxl"
          className="w-full"
          onClick={handleAdd}
          disabled={adding || designs.length === 0 || designs.some((d) => d.uploading)}
        >
          {adding
            ? "Adding…"
            : designs.length > 1
              ? `Add ${designs.length} designs — ${money(grandTotal)}`
              : "Add to Cart"}
        </Button>
      </div>

      {cropOpen && active && (
        <CropDialog
          file={active.file}
          onCancel={() => setCropOpen(false)}
          onApply={applyCrop}
        />
      )}
    </div>
  );
}
