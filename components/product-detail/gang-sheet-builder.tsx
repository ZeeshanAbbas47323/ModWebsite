"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  loadGangSheetEmbed,
  type GangSheetCartItem,
  type GangSheetInstance,
  type GangSheetSession,
} from "@/lib/gang-sheet";

interface GangSheetBuilderProps {
  open: boolean;
  onClose: () => void;
  /** Shown in the overlay header. */
  productName: string;
  /** Builder-side product slug the session should open on. */
  builderProductSlug?: string;
  onAddToCart: (item: GangSheetCartItem) => Promise<void>;
}

async function startSession(
  productSlug: string | undefined,
  name: string
): Promise<GangSheetSession> {
  const res = await fetch("/api/gang-sheet/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productSlug, name }),
  });
  const data = await res.json();
  if (!res.ok || !data.sessionId || !data.token) {
    throw new Error(data.message ?? "Could not start the builder.");
  }
  return { sessionId: data.sessionId, token: data.token };
}

export function GangSheetBuilder({
  open,
  onClose,
  productName,
  builderProductSlug,
  onAddToCart,
}: GangSheetBuilderProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<GangSheetInstance | null>(null);
  // Callbacks are read from a ref so remounting never depends on their identity.
  const handlersRef = useRef({ onAddToCart, onClose });
  useEffect(() => {
    handlersRef.current = { onAddToCart, onClose };
  }, [onAddToCart, onClose]);

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  // The layout wraps pages in a z-indexed element, which would trap a fixed
  // overlay beneath the sticky header. Portal to <body> to escape it.
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // document is client-only, so the host can only be picked up after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalHost(document.body);
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    // Mounting the builder is an external side effect, so the loading state has
    // to be entered from the effect that starts it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
     
    setError(null);

    loadGangSheetEmbed()
      .then(() => {
        if (cancelled || !mountRef.current || !window.GangSheetBuilder) return;

        instanceRef.current = window.GangSheetBuilder.mount({
          target: mountRef.current,
          height: "100%",
          createSession: () => startSession(builderProductSlug, productName),
          onReady: () => {
            if (!cancelled) setStatus("ready");
          },
          onAddToCart: async (item) => {
            // Throwing here tells the builder the add failed, so it keeps the
            // shopper's work instead of clearing the canvas.
            await handlersRef.current.onAddToCart(item);
            handlersRef.current.onClose();
          },
          onCancel: () => handlersRef.current.onClose(),
          onError: (message) => {
            if (cancelled) return;
            setError(message);
            setStatus("error");
          },
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [open, builderProductSlug, productName]);

  // Close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlersRef.current.onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !portalHost) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Gang sheet builder — ${productName}`}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      <header className="flex items-center justify-between gap-4 px-4 md:px-6 h-16 border-b border-gray-200 shrink-0">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Gang sheet builder
          </p>
          <h2 className="text-base md:text-lg font-bold text-black truncate">
            {productName}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close the builder"
          className="shrink-0 h-10 px-4 rounded-xl border border-gray-300 text-sm font-medium hover:bg-black/5 transition-colors"
        >
          Close
        </button>
      </header>

      <div className="relative flex-1 min-h-0">
        <div ref={mountRef} className="w-full h-full [&>iframe]:h-full" />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
            <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-primary animate-spin" />
            <p className="text-gray-600">Opening the builder…</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-6">
            <div className="max-w-md text-center">
              <h3 className="text-xl font-bold text-black mb-3">
                The builder could not load
              </h3>
              <p className="text-gray-600 mb-6 break-words">{error}</p>
              <button
                onClick={onClose}
                className="h-12 px-6 rounded-xl bg-black text-white font-medium"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    portalHost
  );
}
