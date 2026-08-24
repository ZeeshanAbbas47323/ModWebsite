"use client";

import React from 'react';
import { CartItem } from './cart-item';
import { OrderSummary } from './order-summary';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useCart } from '@/contexts/cart-context';

export const CartWrapper = () => {
  const { lines, isLoading, isSyncing, itemCount } = useCart();

  return (
    <section className="container pt-10 pb-20 md:pt-16 md:pb-32">
      {/* Header section */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-4">
          Your Cart{itemCount > 0 ? ` (${itemCount})` : ''}
        </h1>
        <p className="text-gray-600 text-base md:text-lg max-w-3xl">
          Reminder: Orders placed before 2 PM qualify for same-day pickup or shipping.<br className="hidden sm:block" />
          For urgent needs within 2 hours, please select the rush order option. <Link href="#" className="text-[#0056b3] underline hover:text-[#003d82]">Click here for Rush Order</Link>
        </p>
        {isSyncing && (
          <p className="text-sm text-gray-500 mt-3">Syncing your cart with your account…</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[20px] bg-[#F4F4F5] animate-pulse" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 md:py-24 bg-[#F4F4F5] rounded-[24px]">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Looks like you haven&apos;t added anything yet. Browse our products and find something you love.
          </p>
          <Link href="/products">
            <Button size="xl">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        /* Main Cart Layout */
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Column: Cart Items */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {lines.map((line) => (
              <CartItem key={line.key} line={line} />
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
            <OrderSummary />
          </div>
        </div>
      )}
    </section>
  );
};
