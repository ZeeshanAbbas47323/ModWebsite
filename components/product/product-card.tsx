"use client";

import Link from 'next/link';
import React, { useState } from 'react'
import type { Product } from '@/services/product.service';
import { useCart } from '@/contexts/cart-context';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { SafeImage } from '@/components/shared/safe-image';
import { resolveImageUrl } from "@/lib/image-url";
import {
    isLowStock,
    isOutOfStock,
    useInventoryEnforcedCategoryIds,
} from "@/lib/inventory";

export interface ProductCardData {
    id?: number;
    title: string;
    count: string;
    img_path: string;
    slug?: string;

    href?: string;

    product?: Product;
}

interface ProductCardProps {
    data: ProductCardData;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
    const href = data.href ?? (data.slug ? `/products/${data.slug}` : data.id ? `/product-detail?id=${data.id}` : "/product-detail");
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const enforcedCategoryIds = useInventoryEnforcedCategoryIds();
    const outOfStock = isOutOfStock(data.product, enforcedCategoryIds);
    const lowStock = isLowStock(data.product, enforcedCategoryIds);

    const canQuickAdd =
        !!data.product && !data.product.variants?.length && !outOfStock;

    const handleQuickAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!data.product || adding || outOfStock) return;
        setAdding(true);
        try {
            await addItem({ product: data.product, quantity: 1, image: data.img_path });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch {
        } finally {
            setAdding(false);
        }
    };

    return (
        <Link href={href} className="flex flex-col items-center group cursor-pointer">
            <div className="w-full bg-[#F4F4F5] h-[350px] rounded-[24px] aspect-square mb-6 relative overflow-hidden">
                {outOfStock && (
                    <span className="absolute top-4 left-4 z-10 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                        Out of stock
                    </span>
                )}
                {!outOfStock && lowStock && (
                    <span className="absolute top-4 left-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                        Low stock
                    </span>
                )}
                {data.product && (
                    <WishlistButton
                        product={data.product}
                        image={data.img_path}
                        className="absolute top-4 right-4 z-10"
                    />
                )}
                <SafeImage
                    src={resolveImageUrl(data.img_path)}
                    alt={data.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className={`object-cover transition-transform duration-500 ease-out group-hover:scale-110${
                        outOfStock ? " opacity-60 grayscale" : ""
                    }`}
                    placeholderClassName="!object-contain p-10 bg-white"
                />

                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    {outOfStock ? (
                        <span className="mb-16 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-lg transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                            Out of stock
                        </span>
                    ) : canQuickAdd ? (
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
            {outOfStock && (
                <p className="text-center text-sm font-semibold text-red-600">
                    Out of stock
                </p>
            )}
        </Link>
    )
}

export default ProductCard
