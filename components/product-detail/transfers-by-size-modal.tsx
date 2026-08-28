"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  TransfersBySize,
  type TransferSelection,
} from "@/components/product-detail/transfers-by-size";

interface TransfersBySizeModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  onAddToCart: (selection: TransferSelection) => Promise<void>;
}

export function TransfersBySizeModal({
  open,
  onClose,
  productName,
  onAddToCart,
}: TransfersBySizeModalProps) {
  // The layout wraps pages in a z-indexed element, which would trap a fixed
  // overlay beneath the sticky header. Portal to <body> to escape it.
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // document is client-only, so the host can only be picked up after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalHost(document.body);
  }, []);

  // Close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !portalHost) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-stretch md:items-center md:justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Build your transfer — ${productName}`}
        className="relative z-10 flex flex-col w-full md:max-w-5xl md:max-h-[92vh] md:my-auto bg-white md:rounded-[24px] overflow-hidden shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 px-5 md:px-8 h-16 border-b border-gray-200 shrink-0">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Transfers by size
            </p>
            <h2 className="text-base md:text-lg font-bold text-black truncate">
              {productName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 h-10 px-4 rounded-xl border border-gray-300 text-sm font-medium hover:bg-black/5 transition-colors"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <TransfersBySize
            onAddToCart={async (selection) => {
              await onAddToCart(selection);
              onClose();
            }}
          />
        </div>
      </div>
    </div>,
    portalHost
  );
}
