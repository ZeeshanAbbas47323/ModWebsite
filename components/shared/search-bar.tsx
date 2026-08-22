"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useSearch } from '@/hooks/use-search';
import { resolveImageUrl } from '@/lib/image-url';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { data, isLoading } = useSearch(query);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const hasResults = data && (data.products?.length || data.categories?.length || data.blogs?.length || data.pages?.length);

    return (
        <div ref={ref} className="relative w-full">
            <div className="relative w-full flex items-center">
                <div className="absolute left-4 z-10 flex items-center justify-center">
                    <Image src="/images/icons/search.svg" alt="Search" width={20} height={20} className="opacity-50" />
                </div>
                <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-black bg-white text-md text-muted-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            {isOpen && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border z-50 max-h-[400px] overflow-y-auto">
                    {isLoading && (
                        <div className="p-4 text-sm text-gray-500">Searching...</div>
                    )}

                    {!isLoading && !hasResults && (
                        <div className="p-4 text-sm text-gray-500">No results found</div>
                    )}

                    {!isLoading && hasResults && (
                        <div className="p-2">
                            {data.products?.length > 0 && (
                                <div>
                                    <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">Products</p>
                                    {data.products.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={p.slug ? `/products/${p.slug}` : `/product-detail?id=${p.id}`}
                                            onClick={() => { setIsOpen(false); setQuery(''); }}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            {p.image_url && (
                                                <Image src={resolveImageUrl(p.image_url)} alt={p.name} width={40} height={40} className="rounded-lg object-cover" unoptimized />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-black truncate">{p.name}</p>
                                                <p className="text-xs text-gray-500">${Number(p.base_price).toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {data.categories?.length > 0 && (
                                <div>
                                    <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Categories</p>
                                    {data.categories.map((c) => (
                                        <Link
                                            key={c.id}
                                            href={`/products?category=${c.id}`}
                                            onClick={() => { setIsOpen(false); setQuery(''); }}
                                            className="block px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium text-black transition-colors"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {data.blogs?.length > 0 && (
                                <div>
                                    <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Blog Posts</p>
                                    {data.blogs.map((b) => (
                                        <Link
                                            key={b.id}
                                            href={`/blogs/${b.slug}`}
                                            onClick={() => { setIsOpen(false); setQuery(''); }}
                                            className="block px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium text-black transition-colors"
                                        >
                                            {b.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
