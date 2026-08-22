import React from 'react';
import Image from 'next/image';

interface CartItemProps {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export const CartItem: React.FC<CartItemProps> = ({ title, price, quantity, image }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-[#F4F4F5] p-4 rounded-[20px] w-full">
      {/* Product Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-white">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-center text-center sm:text-left w-full">
        <h3 className="text-lg font-bold text-black">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">${price.toFixed(2)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 sm:ml-auto w-full sm:w-auto justify-between sm:justify-end">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black hover:opacity-70 transition-opacity">
            <Image src="/images/icons/minus.svg" alt="Minus" width={16} height={16} className="object-contain" />
          </button>
          <span className="font-bold text-black min-w-[20px] text-center select-none text-xl">{quantity}</span>
          <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black hover:opacity-70 transition-opacity">
            <Image src="/images/icons/plus.svg" alt="Plus" width={16} height={16} className="object-contain" />
          </button>
        </div>

        {/* Delete Button */}
        <button className="hover:opacity-70 transition-opacity p-2 shrink-0 sm:ml-4">
          <Image src="/images/icons/delete.svg" alt="Delete" width={24} height={24} className="object-contain" />
        </button>
      </div>
    </div>
  );
};
