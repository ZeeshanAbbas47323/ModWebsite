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
    Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useProductImages, useProductDescriptions, useProductFaqs, useProductVariants, useIncreaseView, useProduct } from '@/hooks/use-products';
import { useCart } from '@/contexts/cart-context';
import { useReviews } from '@/hooks/use-reviews';
import type { Product } from '@/services/product.service';
import { resolveImageUrl } from '@/lib/image-url';
import { VariantSelector } from '@/components/product-detail/variant-selector';
import { GangSheetBuilder } from '@/components/product-detail/gang-sheet-builder';
import { TransfersBySizeModal } from '@/components/product-detail/transfers-by-size-modal';
import { type TransferSelection } from '@/components/product-detail/transfers-by-size';
import { isTransfersBySizeProduct } from '@/lib/transfers-by-size';
import { needsArtworkUpload } from '@/lib/artwork-upload';
import { ArtworkUpload, type ArtworkFile } from '@/components/product-detail/artwork-upload';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { uploadService } from '@/services/upload.service';
import {
    gangSheetDesignUploads,
    gangSheetPrintMethod,
    matchBuilderProduct,
    type GangSheetCartItem,
} from '@/lib/gang-sheet';
import { useGangSheetProducts } from '@/hooks/use-gang-sheet-products';
import { isVariantAvailable, productStock, tracksVariantStock } from '@/services/product.service';
import type { ProductVariant } from '@/services/product.service';

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

const ProductDetail = ({ product: productProp, productId }: ProductDetailProps) => {
    const id = productProp?.id ?? productId ?? 0;
    const [activeThumb, setActiveThumb] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const increaseView = useIncreaseView();
    const { addItem } = useCart();

    // The /product-detail?id= route passes only an id, so fetch the record the
    // cart needs (name, price, images) when the parent did not supply it.
    const { data: fetchedProduct } = useProduct(productProp ? 0 : id);
    const product = productProp ?? fetchedProduct ?? null;

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [added, setAdded] = useState(false);
    const [builderOpen, setBuilderOpen] = useState(false);
    const [transferToolOpen, setTransferToolOpen] = useState(false);
    const [artwork, setArtwork] = useState<ArtworkFile[]>([]);

    const { data: apiImages } = useProductImages(id);
    const { data: descriptions } = useProductDescriptions(id);
    const { data: faqs } = useProductFaqs(id);
    const { data: variants } = useProductVariants(id);
    const { data: reviewsData } = useReviews({ filters: { product_id: id } });
    const { data: builderProducts } = useGangSheetProducts();

    // `sort` mutates, so copy first — apiImages is the React Query cache.
    // The same photo can be attached to a product more than once, so collapse
    // duplicates rather than showing the gallery twice.
    const images = apiImages?.length
        ? [...new Set(
            [...apiImages]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((img) => resolveImageUrl(img.image_url, fallbackImages[0]))
          )]
        : product?.images?.map((img) => resolveImageUrl(img.image_url, fallbackImages[0])) ?? fallbackImages;

    const sortedDescriptions = descriptions?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
    const sortedFaqs = faqs?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
    const reviewCount = reviewsData?.pagination?.total ?? 0;

    // A chosen variant overrides the product's headline price.
    const listPrice = selectedVariant?.price ?? product?.base_price;
    const salePrice = selectedVariant ? selectedVariant.sale_price : product?.sale_price;
    const price = salePrice != null ? Number(salePrice) : listPrice != null ? Number(listPrice) : null;
    const originalPrice = salePrice != null && listPrice != null ? Number(listPrice) : null;

    // Variants can carry their own photo; show it as soon as one is picked.
    const variantImage = selectedVariant?.image_url
        ? resolveImageUrl(selectedVariant.image_url, images[0])
        : null;
    const variantImageIndex = variantImage ? images.indexOf(variantImage) : -1;
    const galleryImages = variantImage && variantImageIndex === -1
        ? [variantImage, ...images]
        : images;

    // A product with variants cannot be added until one is chosen, otherwise
    // the order would be missing its SKU.
    const needsVariant = !!variants?.length && !selectedVariant;
    // Stock can live on the product instead of each variant; the selector and
    // this guard have to read it the same way.
    const pooledStock = productStock(product);
    const perVariantTracking = tracksVariantStock(variants);
    const variantOutOfStock =
        !!selectedVariant &&
        !isVariantAvailable(selectedVariant, { pooledStock, perVariantTracking });

    // A product opens the builder only when the builder actually has a matching
    // product. The old category-wide rule is gone: it put a gang sheet builder
    // on things like adhesive powder just because they shared a category.
    const builderProductSlug = matchBuilderProduct(product, builderProducts)?.slug;
    const usesGangSheetBuilder = !!builderProductSlug;
    // This vendor's products are sold through the transfers-by-size tool.
    const usesTransfersBySize = isTransfersBySizeProduct(product?.vendor_id);
    // Ready-to-print products need the customer's own file attached.
    const wantsArtwork =
        !usesTransfersBySize && !usesGangSheetBuilder && needsArtworkUpload(product);
    const artworkUploading = artwork.some((f) => !f.stored && !f.error);

    const handleTransferAdd = async (selection: TransferSelection) => {
        if (!product || !selection.file) return;

        // The tool stores each version as it is made, so normally there is
        // nothing left to upload here.
        const uploaded =
            selection.stored ??
            (await uploadService.toStorage(selection.file, "transfers-by-size"));

        const details = [
            `${selection.widthIn.toFixed(2)}in x ${selection.heightIn.toFixed(2)}in`,
            selection.rushOrder ? "Rush order" : null,
            selection.notes || null,
        ].filter(Boolean).join(" | ");

        await addItem({
            product,
            quantity: selection.quantity,
            image: images[0],
            print_method: "dtf",
            custom_text: details,
            design_uploads: [{
                // Permanent link. A raw S3 URL cannot be used: the bucket is
                // private, ACLs are disabled, and a presigned URL dies after
                // 7 days — long before some orders are printed. This route
                // re-signs on every request, so it never expires.
                file_url: uploaded.url,
                file_name: uploaded.originalName || selection.file.name,
                print_method: "dtf",
            }],
        });
    };

    const handleGangSheetAdd = async (item: GangSheetCartItem) => {
        if (!product) return;
        await addItem({
            product,
            quantity: item.quantity,
            image: images[0],
            custom_text: item.orderId,
            print_method: gangSheetPrintMethod(item),
            design_uploads: gangSheetDesignUploads(item),
        });
    };

    const handleAddToCart = async () => {
        if (!product) return;
        if (usesGangSheetBuilder) {
            setBuilderOpen(true);
            return;
        }
        if (usesTransfersBySize) {
            setTransferToolOpen(true);
            return;
        }
        if (needsVariant) {
            setAddError(
                variants?.some((v) => v.color) && variants?.some((v) => v.size)
                    ? "Please choose a colour and size first."
                    : "Please choose an option first."
            );
            return;
        }
        if (variantOutOfStock) {
            setAddError("That combination is out of stock.");
            return;
        }
        if (wantsArtwork) {
            if (artwork.length === 0) {
                setAddError("Please upload your artwork first.");
                return;
            }
            if (artworkUploading) {
                setAddError("Still uploading your artwork — one moment.");
                return;
            }
            if (artwork.some((f) => !f.stored)) {
                setAddError("Some files did not upload. Remove them and try again.");
                return;
            }
        }
        setAddError(null);
        setAdding(true);
        try {
            await addItem({
                product,
                variant: selectedVariant,
                quantity,
                image: variantImage ?? images[0],
                design_uploads: wantsArtwork
                    ? artwork
                        .filter((file) => file.stored)
                        .map((file) => ({
                            file_url: file.stored!.url,
                            file_name: file.stored!.originalName || file.name,
                        }))
                    : undefined,
            });
            setArtwork([]);
            setAdded(true);
            setTimeout(() => setAdded(false), 2500);
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "Could not add to cart");
        } finally {
            setAdding(false);
        }
    };

    useEffect(() => {
        if (id) increaseView.mutate(id);
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!api) return;
        api.on("select", () => setActiveThumb(api.selectedScrollSnap()));
    }, [api]);

    // Jump the gallery to the picked variant's photo. Prepended images sit at
    // index 0; otherwise scroll to wherever the photo already lives.
    useEffect(() => {
        if (!api || !variantImage) return;
        api.scrollTo(variantImageIndex === -1 ? 0 : variantImageIndex);
    }, [api, variantImage, variantImageIndex]);

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
                        {galleryImages.map((img, index) => (
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
                                {galleryImages.map((img, idx) => (
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

                    {!usesGangSheetBuilder && !usesTransfersBySize && variants && variants.length > 0 && (
                        <VariantSelector
                            variants={variants}
                            selected={selectedVariant}
                            onSelect={setSelectedVariant}
                            pooledStock={pooledStock}
                        />
                    )}

                    {wantsArtwork && (
                        <ArtworkUpload files={artwork} onChange={setArtwork} />
                    )}

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {!usesGangSheetBuilder && !usesTransfersBySize && (
                        <div className="flex items-center gap-4 bg-[#F4F4F5] rounded-xl px-4 h-14">
                            <button
                                aria-label="Decrease quantity"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                                className="text-2xl leading-none text-black disabled:opacity-40"
                            >
                                &minus;
                            </button>
                            <span className="font-bold text-lg min-w-[24px] text-center">{quantity}</span>
                            <button
                                aria-label="Increase quantity"
                                onClick={() => setQuantity((q) => q + 1)}
                                className="text-2xl leading-none text-black"
                            >
                                +
                            </button>
                        </div>
                        )}

                        <Button size="xxl" className="flex-1 min-w-[200px]" onClick={handleAddToCart} disabled={adding || !product || (!usesGangSheetBuilder && variantOutOfStock) || artworkUploading}>
                            {adding
                                ? "Adding\u2026"
                                : added
                                    ? "Added to Cart"
                                    : usesGangSheetBuilder
                                        ? "Build your own Gang Sheet"
                                        : usesTransfersBySize
                                            ? "Build your Transfer"
                                            : "Add to Cart"}
                        </Button>

                        {product && (
                            <WishlistButton
                                variantStyle="inline"
                                product={product}
                                variant={selectedVariant}
                                image={variantImage ?? images[0]}
                            />
                        )}
                    </div>

                    {addError && <p className="text-sm text-red-600 -mt-3 mb-6">{addError}</p>}

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

            {usesTransfersBySize && (
                <TransfersBySizeModal
                    open={transferToolOpen}
                    onClose={() => setTransferToolOpen(false)}
                    productName={product?.name ?? "Transfer"}
                    onAddToCart={handleTransferAdd}
                />
            )}

            {usesGangSheetBuilder && (
                <GangSheetBuilder
                    open={builderOpen}
                    onClose={() => setBuilderOpen(false)}
                    productName={product?.name ?? "Gang sheet"}
                    builderProductSlug={builderProductSlug}
                    onAddToCart={handleGangSheetAdd}
                />
            )}
        </section>
    );
}

export default ProductDetail
