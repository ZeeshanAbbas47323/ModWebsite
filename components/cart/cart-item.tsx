"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import type { CartLine } from '@/lib/cart-storage';

interface CartItemProps {
  line: CartLine;
}

export const CartItem: React.FC<CartItemProps> = ({ line }) => {
  const { updateQuantity, removeItem } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this item");
    } finally {
      setBusy(false);
    }
  };

  const isExternal = line.image.startsWith('http');
  const lineTotal = line.price * line.quantity;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-[#F4F4F5] p-4 rounded-[20px] w-full transition-opacity ${busy ? 'opacity-60' : ''}`}>
      {/* Product Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-white">
        <Image
          src={line.image}
          alt={line.name}
          fill
          className="object-contain p-2"
          {...(isExternal ? { unoptimized: true } : {})}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-center text-center sm:text-left w-full">
        {line.slug ? (
          <Link href={`/products/${line.slug}`} className="text-lg font-bold text-black hover:text-primary transition-colors">
            {line.name}
          </Link>
        ) : (
          <h3 className="text-lg font-bold text-black">{line.name}</h3>
        )}
        {line.variant_label && (
          <p className="text-gray-500 text-xs mt-0.5">{line.variant_label}</p>
        )}
        {line.print_method && (
          <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-wide">
            {line.print_method.replace(/_/g, ' ')}
          </p>
        )}
        {line.custom_text && (
          <p className="text-gray-500 text-xs mt-0.5 italic">&ldquo;{line.custom_text}&rdquo;</p>
        )}
        <p className="text-gray-500 text-sm mt-1">${line.price.toFixed(2)} each</p>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 sm:ml-auto w-full sm:w-auto justify-between sm:justify-end">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Decrease quantity"
            disabled={busy || line.quantity <= 1}
            onClick={() => run(() => updateQuantity(line.key, line.quantity - 1))}
            className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black hover:opacity-70 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Image src="/images/icons/minus.svg" alt="" width={16} height={16} className="object-contain" />
          </button>
          <span className="font-bold text-black min-w-[20px] text-center select-none text-xl">{line.quantity}</span>
          <button
            aria-label="Increase quantity"
            disabled={busy}
            onClick={() => run(() => updateQuantity(line.key, line.quantity + 1))}
            className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black hover:opacity-70 transition-opacity disabled:opacity-40"
          >
            <Image src="/images/icons/plus.svg" alt="" width={16} height={16} className="object-contain" />
          </button>
        </div>

        <span className="font-bold text-black text-lg min-w-[80px] text-right hidden sm:block">
          ${lineTotal.toFixed(2)}
        </span>

        {/* Delete Button */}
        <button
          aria-label={`Remove ${line.name} from cart`}
          disabled={busy}
          onClick={() => run(() => removeItem(line.key))}
          className="hover:opacity-70 transition-opacity p-2 shrink-0 sm:ml-4 disabled:opacity-40"
        >
          <Image src="/images/icons/delete.svg" alt="" width={24} height={24} className="object-contain" />
        </button>
      </div>
    </div>
  );
};
