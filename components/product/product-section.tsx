import React from 'react'
import ProductCard, { type ProductCardData } from './product-card';

interface ProductSectionProps {
    data: ProductCardData[];
    title?: string;
    description?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ data, title, description }) => {
    return (
        <>
            <section className="container w-full pt-10 md:pt-12 lg:pt-16 flex flex-col items-center">
                <div className="text-center mb-6 md:mb-10">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 tracking-tight">{title}</h2>
                    <p className="text-[#464545] text-lg">{description}</p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative mb-6 md:mb-10">
                    {data.map((product, index) => (
                        <ProductCard key={index} data={product} />
                    ))}
                </div>
            </section>
        </>
    )
}

export default ProductSection