"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CropRect } from "@/services/image-tools.service";

interface CropDialogProps {
  file: File;
  onCancel: () => void;
  onApply: (rect: CropRect) => void;
}

type Handle = "nw" | "ne" | "sw" | "se" | "move";

const MIN_FRACTION = 0.05;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Drag a selection over the artwork; the rect is stored as 0–1 fractions. */
export function CropDialog({ file, onCancel, onApply }: CropDialogProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [rect, setRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ handle: Handle; startX: number; startY: number; start: CropRect } | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // Object URLs only exist on the client, so this has to happen after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const pointerFraction = useCallback((clientX: number, clientY: number) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    return {
      x: clamp01((clientX - box.left) / box.width),
      y: clamp01((clientY - box.top) / box.height),
    };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const state = drag.current;
      if (!state) return;
      const { x, y } = pointerFraction(e.clientX, e.clientY);
      const dx = x - state.startX;
      const dy = y - state.startY;
      const s = state.start;

      if (state.handle === "move") {
        setRect({
          ...s,
          x: clamp01(Math.min(s.x + dx, 1 - s.width)),
          y: clamp01(Math.min(s.y + dy, 1 - s.height)),
        });
        return;
      }

      const left = state.handle === "nw" || state.handle === "sw";
      const top = state.handle === "nw" || state.handle === "ne";

      let nx = s.x;
      let ny = s.y;
      let nw = s.width;
      let nh = s.height;

      if (left) {
        nx = clamp01(Math.min(s.x + dx, s.x + s.width - MIN_FRACTION));
        nw = s.width + (s.x - nx);
      } else {
        nw = Math.max(MIN_FRACTION, Math.min(s.width + dx, 1 - s.x));
      }
      if (top) {
        ny = clamp01(Math.min(s.y + dy, s.y + s.height - MIN_FRACTION));
        nh = s.height + (s.y - ny);
      } else {
        nh = Math.max(MIN_FRACTION, Math.min(s.height + dy, 1 - s.y));
      }

      setRect({ x: nx, y: ny, width: nw, height: nh });
    };

    const onUp = () => {
      drag.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pointerFraction]);

  const startDrag = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = pointerFraction(e.clientX, e.clientY);
      drag.current = { handle, startX: x, startY: y, start: rect };
    },
    [pointerFraction, rect]
  );

  const handleStyle = "absolute w-4 h-4 bg-white border-2 border-black rounded-sm";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crop your design"
        className="relative z-10 bg-white rounded-[24px] p-5 md:p-6 w-full max-w-2xl shadow-2xl"
      >
        <h3 className="text-lg font-bold text-black mb-4">Crop your design</h3>

        <div
          ref={frameRef}
          className="relative w-full select-none touch-none bg-[#F4F4F5] rounded-xl overflow-hidden"
          style={{ aspectRatio: "4 / 3" }}
        >
          {url && (
            // A local blob URL — next/image would add nothing here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-contain pointer-events-none" />
          )}

          {/* Dimmed area outside the selection */}
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />

          <div
            onPointerDown={startDrag("move")}
            className="absolute cursor-move ring-2 ring-white"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0)",
            }}
          >
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt="Crop preview"
                className="absolute pointer-events-none max-w-none"
                style={{
                  width: `${100 / rect.width}%`,
                  height: `${100 / rect.height}%`,
                  left: `${(-rect.x / rect.width) * 100}%`,
                  top: `${(-rect.y / rect.height) * 100}%`,
                  objectFit: "contain",
                }}
              />
            )}
            <span onPointerDown={startDrag("nw")} className={`${handleStyle} -left-2 -top-2 cursor-nwse-resize`} />
            <span onPointerDown={startDrag("ne")} className={`${handleStyle} -right-2 -top-2 cursor-nesw-resize`} />
            <span onPointerDown={startDrag("sw")} className={`${handleStyle} -left-2 -bottom-2 cursor-nesw-resize`} />
            <span onPointerDown={startDrag("se")} className={`${handleStyle} -right-2 -bottom-2 cursor-nwse-resize`} />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Drag the box to move it, or the corners to resize.
        </p>

        <div className="flex flex-wrap gap-3 justify-end mt-5">
          <Button
            variant="outline"
            onClick={() => setRect({ x: 0, y: 0, width: 1, height: 1 })}
          >
            Select all
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onApply(rect)}>Apply crop</Button>
        </div>
      </div>
    </div>
  );
}
