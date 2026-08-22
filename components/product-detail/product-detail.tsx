"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useProductImages, useProductDescriptions, useProductFaqs, useProductVariants, useIncreaseView } from '@/hooks/use-products';
import { useReviews } from '@/hooks/use-reviews';
import type { Product } from '@/services/product.service';
import { resolveImageUrl } from '@/lib/image-url';

interface ProductDetailProps {
    product?: Product | null;
    productId?: number;
}

const fallbackImages = [
    "/images/products/dtf-ink-cymk.png",
    "/images/products/dtf-printing-service.png",
    "/images/products/adhesive-powder.png",
    "/images/products/dtf-gang-sheet.svg",
];

const ProductDetail = ({ product, productId }: ProductDetailProps) => {
    const id = product?.id ?? productId ?? 0;
    const [activeThumb, setActiveThumb] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const increaseView = useIncreaseView();

    const { data: apiImages } = useProductImages(id);
    const { data: descriptions } = useProductDescriptions(id);
    const { data: faqs } = useProductFaqs(id);
    const { data: variants } = useProductVariants(id);
    const { data: reviewsData } = useReviews({ filters: { product_id: id } });

    const images = apiImages?.length
        ? apiImages.sort((a, b) => a.sort_order - b.sort_order).map((img) => resolveImageUrl(img.image_url, fallbackImages[0]))
        : product?.images?.map((img) => resolveImageUrl(img.image_url, fallbackImages[0])) ?? fallbackImages;

    const sortedDescriptions = descriptions?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
    const sortedFaqs = faqs?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
    const reviewCount = reviewsData?.pagination?.total ?? 0;

    const price = product?.sale_price != null ? Number(product.sale_price) : product?.base_price != null ? Number(product.base_price) : null;
    const originalPrice = product?.sale_price ? Number(product.base_price) : null;

    useEffect(() => {
        if (id) increaseView.mutate(id);
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!api) return;
        api.on("select", () => setActiveThumb(api.selectedScrollSnap()));
    }, [api]);

    const onThumbClick = (index: number) => {
        setActiveThumb(index);
        api?.scrollTo(index);
    };

    if (!product && !productId) {
        return (
            <section className="container pt-10 md:pt-12 lg:pt-16">
                <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-7 h-[500px] bg-gray-100 rounded-3xl" />
                    <div className="lg:col-span-5 space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-100 rounded w-1/4" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="container pt-10 md:pt-12 lg:pt-16">
            <Breadcrumb className="mb-6 md:mb-10">
                <BreadcrumbList className="text-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild><Link href="/products">Products</Link></BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">
                            {product?.name ?? "Product"}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
                    <div className="order-2 sm:order-1 sm:w-[100px] shrink-0 flex flex-row sm:flex-col gap-4 overflow-x-auto sm:overflow-visible no-scrollbar">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => onThumbClick(index)}
                                className={cn(
                                    "relative w-20 h-20 sm:w-full sm:h-[100px] rounded-xl overflow-hidden border-2 transition-all shrink-0",
                                    activeThumb === index ? "border-[#C8E100]" : "border-transparent"
                                )}
                            >
                                <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" unoptimized />
                            </button>
                        ))}
                    </div>

                    <div className="order-1 sm:order-2 flex-1 rounded-3xl relative overflow-hidden aspect-square sm:aspect-auto sm:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-100">
                        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full h-full">
                            <CarouselContent className="ml-0">
                                {images.map((img, idx) => (
                                    <CarouselItem key={idx} className="relative w-full pl-0 aspect-square sm:aspect-auto sm:h-[500px] lg:h-[600px]">
                                        <div className="relative w-full h-full">
                                            <Image src={img} alt={`Product Image ${idx + 1}`} fill className="object-cover" priority={idx === 0} unoptimized />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </div>
                </div>

                <div className="lg:col-span-5 w-full">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-4 leading-tight">
                        {product?.name ?? "Product"}
                    </h1>

                    {reviewCount > 0 && (
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Image key={i} src="/images/icons/star.svg" alt="Star" width={16} height={16} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">/ {reviewCount} reviews</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl sm:text-3xl font-bold text-black">
                            {price ? `$${price.toFixed(2)}` : ""}
                        </span>
                        {originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                                ${originalPrice.toFixed(2)}
                            </span>
                        )}
                        {product?.discount_percent ? (
                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                                -{product.discount_percent}%
                            </span>
                        ) : null}
                    </div>

                    {product?.short_desc && (
                        <p className="text-sm text-gray-600 mb-6">{product.short_desc}</p>
                    )}

                    <div className="text-sm text-gray-600 mb-8">
                        <span className="underline cursor-pointer decoration-gray-400 underline-offset-4">Shipping</span> calculated at checkout.
                    </div>

                    {variants && variants.length > 0 && (
                        <div className="mb-6 max-w-xs">
                            <Select>
                                <SelectTrigger className="w-full h-12 rounded-xl text-base border-gray-300">
                                    <SelectValue placeholder="Select variant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {variants.map((v) => (
                                        <SelectItem key={v.id} value={String(v.id)}>
                                            {[v.size?.name, v.color?.name].filter(Boolean).join(" - ") || v.sku}
                                            {v.price ? ` ($${Number(v.price).toFixed(2)})` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button size="xxl" className='mb-6'>
                        {product?.is_customizable ? "Build your own Gang Sheet" : "Add to Cart"}
                    </Button>

                    {(sortedDescriptions.length > 0 || sortedFaqs.length > 0) && (
                        <Accordion type="single" collapsible className="w-full">
                            {sortedDescriptions.map((desc, i) => (
                                <AccordionItem key={`desc-${desc.id}`} value={`desc-${i}`} className="border-b-0 mb-2">
                                    <AccordionTrigger className="text-base font-bold hover:no-underline py-3 px-0 text-black [&>svg]:text-black">
                                        {desc.title}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600 text-base" dangerouslySetInnerHTML={{ __html: desc.content }} />
                                </AccordionItem>
                            ))}
                            {sortedFaqs.map((faq, i) => (
                                <AccordionItem key={`faq-${faq.id}`} value={`faq-${i}`} className="border-b-0 mb-2">
                                    <AccordionTrigger className="text-base font-bold hover:no-underline py-3 px-0 text-black [&>svg]:text-black">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600 text-base">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ProductDetail
