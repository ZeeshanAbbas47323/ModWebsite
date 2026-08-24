"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useCart } from '@/contexts/cart-context';

const TAX_RATE = 0.05;

export const OrderSummary = () => {
  const router = useRouter();
  const { lines, subtotal, discount, total, coupon, applyCoupon, removeCoupon } = useCart();

  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  // Shipping and the final tax are calculated by the API once the delivery
  // method is known; this is only an on-page estimate.
  const estimatedTax = total * TAX_RATE;
  const estimatedTotal = total + estimatedTax;
  const isEmpty = lines.length === 0;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setApplying(true);
    try {
      await applyCoupon(code);
      setCode('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8 w-full flex flex-col h-fit">
      <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Order Summary</h2>

      {/* Coupon */}
      {coupon ? (
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-6">
          <div className="min-w-0">
            <p className="text-sm font-bold text-black truncate">{coupon.code}</p>
            <p className="text-xs text-green-700">Coupon applied</p>
          </div>
          <button
            onClick={removeCoupon}
            className="text-sm text-gray-500 hover:text-black underline shrink-0 ml-3"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="mb-6">
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              className="bg-white h-11 rounded-xl"
              disabled={isEmpty}
            />
            <Button type="submit" disabled={isEmpty || applying || !code.trim()} className="h-11 shrink-0">
              {applying ? 'Checking…' : 'Apply'}
            </Button>
          </div>
          {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
        </form>
      )}

      <div className="flex flex-col gap-4 text-black text-sm md:text-base">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sub Total:</span>
          <span className="font-bold">${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-center text-green-700">
            <span>Discount:</span>
            <span className="font-bold">-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-bold">Calculated at checkout</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tax (Estimated 5%)</span>
          <span className="font-bold">${estimatedTax.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-gray-300 my-6"></div>

      <div className="flex justify-between items-center mb-8">
        <span className="font-bold text-black text-lg md:text-xl">Total</span>
        <span className="font-bold text-black text-xl md:text-2xl">${estimatedTotal.toFixed(2)}</span>
      </div>

      <Button
        size="xl"
        className="w-full"
        disabled={isEmpty}
        onClick={() => router.push('/checkout')}
      >
        Proceed to Checkout
      </Button>
      {isEmpty && (
        <p className="text-xs text-gray-500 text-center mt-3">Add something to your cart first.</p>
      )}
    </div>
  );
};
