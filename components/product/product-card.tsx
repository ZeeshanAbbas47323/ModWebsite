"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import type { Product } from '@/services/product.service';
import { useCart } from '@/contexts/cart-context';

export interface ProductCardData {
    id?: number;
    title: string;
    count: string;
    img_path: string;
    slug?: string;
    /** Overrides the product link — used by collection cards. */
    href?: string;
    /** Present for real products; category cards leave it undefined. */
    product?: Product;
}

interface ProductCardProps {
    data: ProductCardData;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
    const href = data.href ?? (data.slug ? `/products/${data.slug}` : data.id ? `/product-detail?id=${data.id}` : "/product-detail");
    const isExternal = data.img_path.startsWith("http");
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    // Variant products need a SKU chosen on the detail page, so quick-add is
    // only offered for simple products.
    const canQuickAdd = !!data.product && !data.product.variants?.length;

    const handleQuickAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!data.product || adding) return;
        setAdding(true);
        try {
            await addItem({ product: data.product, quantity: 1, image: data.img_path });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch {
            // The cart page surfaces failures; keep the card quiet.
        } finally {
            setAdding(false);
        }
    };

    return (
        <Link href={href} className="flex flex-col items-center group cursor-pointer">
            <div className="w-full bg-[#F4F4F5] h-[350px] rounded-[24px] aspect-square flex items-center justify-center p-8 mb-6 relative overflow-hidden">
                <Image
                    src={data.img_path}
                    alt={data.title}
                    width={300}
                    height={300}
                    className="object-contain w-full h-full drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110"
                    {...(isExternal ? { unoptimized: true } : {})}
                />

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    {canQuickAdd ? (
                        <button
                            onClick={handleQuickAdd}
                            disabled={adding}
                            className="bg-white text-black font-bold text-sm px-6 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary disabled:opacity-60"
                        >
                            {adding ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
                        </button>
                    ) : (
                        <div className="bg-white p-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mb-16">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.3-4.3"/>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            <h3 className="text-[22px] font-bold text-black text-center mb-0.5 group-hover:text-primary transition-colors duration-300">{data.title}</h3>
            <p className="text-[#464545] text-center text-lg">{data.count}</p>
        </Link>
    )
}

export default ProductCard
