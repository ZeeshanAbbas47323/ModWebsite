import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';

export const OrderSummary = () => {
  return (
    <div className="bg-[#F4F4F5] rounded-[24px] p-6 md:p-8 w-full flex flex-col h-fit">
      <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Order Summary</h2>

      <div className="flex flex-col gap-4 text-black text-sm md:text-base">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sub Total:</span>
          <span className="font-bold">$5,650</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-bold">Free</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tax (Estimated 5%)</span>
          <span className="font-bold">$210</span>
        </div>
      </div>

      <div className="border-t border-gray-300 my-6"></div>

      <div className="flex justify-between items-center mb-8">
        <span className="font-bold text-black text-lg md:text-xl">Total</span>
        <span className="font-bold text-black text-xl md:text-2xl">$5,860</span>
      </div>

      <Button size="xl" className="w-full mb-4">
        Proceed to Checkout
      </Button>

      {/* Payment Options */}
      <div className="flex flex-col">
        {/* Shop Pay */}
        <Button size="xl" className="w-full mb-4 bg-white hover:bg-white">
          <Image src="/images/payment-gateways/shop.png" alt="Shop Pay" width={80} height={24} className="object-contain" />
        </Button>

        {/* PayPal */}
        <Button size="xl" className="w-full mb-4 bg-white hover:bg-white">
          <Image src="/images/payment-gateways/pay-pal.png" alt="PayPal" width={80} height={24} className="object-contain" />
        </Button>

        {/* Google Pay */}
        <Button size="xl" className="w-full mb-4 bg-white hover:bg-white">
          <Image src="/images/payment-gateways/g-pay.png" alt="Google Pay" width={60} height={24} className="object-contain" />
        </Button>
      </div>
    </div>
  );
};
