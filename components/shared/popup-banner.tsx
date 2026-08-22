"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePopups } from "@/hooks/use-popups";
import type { Popup } from "@/services/popup.service";
import { resolveImageUrl } from "@/lib/image-url";

export function PopupBanner() {
  const { data: popups } = usePopups();
  const [active, setActive] = useState<Popup | null>(null);

  useEffect(() => {
    if (!popups?.length) return;
    const sorted = [...popups].sort((a, b) => b.display_priority - a.display_priority);
    const dismissed = JSON.parse(sessionStorage.getItem("dismissed_popups") || "[]") as number[];
    const next = sorted.find((p) => !dismissed.includes(p.id));
    if (next) {
      const timer = setTimeout(() => setActive(next), 1500);
      return () => clearTimeout(timer);
    }
  }, [popups]);

  if (!active) return null;

  const dismiss = () => {
    const dismissed = JSON.parse(sessionStorage.getItem("dismissed_popups") || "[]") as number[];
    dismissed.push(active.id);
    sessionStorage.setItem("dismissed_popups", JSON.stringify(dismissed));
    setActive(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <button onClick={dismiss} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors text-black font-bold">
          &times;
        </button>

        {active.image_url && (
          <div className="relative w-full h-48">
            <Image src={resolveImageUrl(active.image_url)} alt={active.title} fill className="object-cover" unoptimized />
          </div>
        )}

        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{active.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{active.message}</p>

          {active.coupon_code && (
            <div className="mb-4 p-3 bg-gray-100 rounded-xl text-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Use code</span>
              <p className="text-lg font-bold tracking-widest">{active.coupon_code}</p>
            </div>
          )}

          {active.link_url && active.button_text && (
            <a
              href={active.link_url}
              onClick={dismiss}
              className="block w-full text-center py-3 px-4 bg-black text-white rounded-full font-semibold hover:bg-black/90 transition-colors"
            >
              {active.button_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
