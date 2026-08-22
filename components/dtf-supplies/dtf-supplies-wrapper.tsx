import React from 'react'
import ProductSection from '../product/product-section'
import { NewsletterSection } from '../home/newsletter-section'

const supply_products = [
    {
        title: "DTF Gang Sheets",
        count: "$25.00",
        img_path: "/images/products/dtf-gang-sheet.svg",
    },
    {
        title: "DTF Printing Services",
        count: "$25.00",
        img_path: "/images/products/dtf-printing-service.png",
    },
    {
        title: "DTF Ink (CYMK)",
        count: "$25.00",
        img_path: "/images/products/dtf-ink-cymk.png",
    },
    {
        title: "Adhesive Powder",
        count: "$25.00",
        img_path: "/images/products/adhesive-powder.png",
    }
]


const DTFSuppliesWrapper = () => {
    return (
        <> <ProductSection data={supply_products} title="DTF Supplies Products" description="From small business advertising to big event displays, Modfirst delivers bold." />
            <NewsletterSection /></>
    )
}

export default DTFSuppliesWrapper