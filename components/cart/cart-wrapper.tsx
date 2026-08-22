import React from 'react';
import { CartItem } from './cart-item';
import { OrderSummary } from './order-summary';
import Link from 'next/link';

const DUMMY_CART_ITEMS = [
  {
    id: '1',
    title: 'DTF Gang Sheets',
    price: 25.00,
    quantity: 1,
    image: '/images/products/dtf-gang-sheet.svg',
  },
  {
    id: '2',
    title: 'DTF Gang Sheets',
    price: 25.00,
    quantity: 1,
    image: '/images/products/dtf-gang-sheet.svg',
  },
  {
    id: '3',
    title: 'DTF Gang Sheets',
    price: 25.00,
    quantity: 1,
    image: '/images/products/dtf-gang-sheet.svg',
  },
  {
    id: '4',
    title: 'DTF Gang Sheets',
    price: 25.00,
    quantity: 1,
    image: '/images/products/dtf-gang-sheet.svg',
  },
];

export const CartWrapper = () => {
  return (
    <section className="container pt-10 pb-20 md:pt-16 md:pb-32">
      {/* Header section */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-4">Your Cart</h1>
        <p className="text-gray-600 text-base md:text-lg max-w-3xl">
          Reminder: Orders placed before 2 PM qualify for same-day pickup or shipping.<br className="hidden sm:block" />
          For urgent needs within 2 hours, please select the rush order option. <Link href="#" className="text-[#0056b3] underline hover:text-[#003d82]">Click here for Rush Order</Link>
        </p>
      </div>

      {/* Main Cart Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Left Column: Cart Items */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          {DUMMY_CART_ITEMS.map((item) => (
            <CartItem key={item.id} {...item} />
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-1/3 sticky top-24">
          <OrderSummary />
        </div>
      </div>
    </section>
  );
};
