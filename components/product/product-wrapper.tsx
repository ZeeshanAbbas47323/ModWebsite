"use client";
import { NewsletterSection } from '../home/newsletter-section';
import ProductSection from './product-section';
import { useProducts } from '@/hooks/use-products';
import { useProductCategories } from '@/hooks/use-product-categories';
import { useSearch } from '@/hooks/use-search';
import { mapProductToCard } from '@/lib/map-product-to-card';
import { resolveImageUrl } from '@/lib/image-url';
import type { ProductCardData } from './product-card';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const fallbackProducts = [
    { title: "DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/booklet.png" },
    { title: "Reflective DTF Transfer", count: "50 Products", img_path: "/images/banners-compositions/book.png" },
    { title: "UV DTF", count: "50 Products", img_path: "/images/banners-compositions/shirt.png" },
    { title: "Sublimation", count: "50 Products", img_path: "/images/banners-compositions/launch-box.png" },
    { title: "Custom Patches", count: "50 Products", img_path: "/images/banners-compositions/stamp.svg" },
];

/**
 * Some menu items (T-Shirts, Hoodies) name a group of products with no real
 * ProductCategory behind them — there's simply no such category in the
 * database. Rather than invent one, /products?q=<name> reuses the search
 * endpoint as a lightweight, real-data-driven listing for exactly those
 * cases: no query -> the normal catalogue browse below; a query -> its
 * matching products instead.
 */
function SearchResults({ query }: { query: string }) {
    // The search endpoint caps limit at 20.
    const { data, isLoading } = useSearch(query, ["products"], 20);
    const products = data?.products ?? [];

    const cards: ProductCardData[] = products.map((p) => ({
        id: p.id,
        title: p.name,
        count: p.base_price != null ? `$${Number(p.base_price).toFixed(2)}` : "",
        img_path: p.images?.[0]?.image_url ? resolveImageUrl(p.images[0].image_url) : "/images/products/dtf-gang-sheet.svg",
        slug: p.slug,
    }));

    return (
        <>
            <div className="container pt-8">
                <Link href="/products" className="text-sm text-gray-500 hover:text-black">
                    &larr; All products
                </Link>
            </div>

            {isLoading ? (
                <section className="container pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-[#F4F4F5] h-[350px] rounded-[24px] mb-6" />
                                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : cards.length > 0 ? (
                <ProductSection data={cards} title={query} description={`${cards.length} product${cards.length === 1 ? "" : "s"}`} />
            ) : (
                <section className="container pt-10 md:pt-16 pb-10 text-center">
                    <h1 className="text-2xl font-bold text-black mb-3">Nothing here yet</h1>
                    <p className="text-gray-600">No products match &quot;{query}&quot; right now.</p>
                </section>
            )}

            <NewsletterSection />
        </>
    );
}

const ProductWrapper = () => {
    const [page, setPage] = useState(1);
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.trim();

    const { data: categories } = useProductCategories(null);
    const { data: productsData, isLoading } = useProducts({ page, limit: 24 });

    const productCards = productsData?.payload?.map(mapProductToCard) ?? fallbackProducts;
    const pagination = productsData?.pagination;

    if (query) return <SearchResults query={query} />;

    return (
        <>
            {/* Filtering lives on the collection pages, so these are links now. */}
            {categories && categories.length > 0 && (
                <div className="container pt-8">
                    <div className="flex flex-wrap gap-3">
                        <span className="px-5 py-2 rounded-full text-sm font-medium bg-black text-white">
                            All
                        </span>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="px-5 py-2 rounded-full text-sm font-medium transition-colors bg-[#F4F4F5] text-black hover:bg-black/10"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? (
                <section className="container pt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-[#F4F4F5] h-[350px] rounded-[24px] mb-6" />
                                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                                <div className="h-5 bg-gray-100 rounded w-1/2 mx-auto" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <ProductSection data={productCards} title="Our Products" description="From small business advertising to big event displays, Modfirst delivers bold." />
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="container flex justify-center gap-2 py-8">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                                page === p ? 'bg-black text-white' : 'bg-[#F4F4F5] text-black hover:bg-black/10'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <NewsletterSection />
        </>
    )
}

export default ProductWrapper
