import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import ProductCard, { type ProductCardData } from "./product-card"
import Link from "next/link"

interface ProductCarouselProps {
  data: ProductCardData[];
  title?: string;
  description?: string;
  loading?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ data, title, description }) => {
  return (
    <section className="container w-full pt-10 md:pt-12 lg:pt-16 flex flex-col items-center">
      <div className="text-center mb-6 md:mb-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 tracking-tight">{title}</h2>
        <p className="text-[#464545] text-lg">{description}</p>
      </div>

      <div className="w-full relative mb-6 md:mb-10">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="md:-ml-6">
            {data.map((product, index) => (
              <CarouselItem key={index} className="md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ProductCard data={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex top-[175px] -left-4 lg:-left-5 bg-white hover:bg-white border-white h-10 w-10 shadow-md">
            <svg width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
              <path d="M0 1.48585L1.48725 -7.62939e-06L9.58796 8.09789C9.71853 8.22765 9.82216 8.38195 9.89288 8.55191C9.96359 8.72187 10 8.90414 10 9.08823C10 9.27231 9.96359 9.45458 9.89288 9.62454C9.82216 9.7945 9.71853 9.9488 9.58796 10.0786L1.48725 18.1807L0.0014019 16.6948L7.60448 9.09033L0 1.48585Z" fill="black" />
            </svg>
          </CarouselPrevious>
          <CarouselNext className="hidden md:flex top-[175px] -right-4 lg:-right-5 border-white hover:bg-white h-10 w-10 shadow-md">
            <svg width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 1.48585L1.48725 -7.62939e-06L9.58796 8.09789C9.71853 8.22765 9.82216 8.38195 9.89288 8.55191C9.96359 8.72187 10 8.90414 10 9.08823C10 9.27231 9.96359 9.45458 9.89288 9.62454C9.82216 9.7945 9.71853 9.9488 9.58796 10.0786L1.48725 18.1807L0.0014019 16.6948L7.60448 9.09033L0 1.48585Z" fill="black" />
            </svg>
          </CarouselNext>
        </Carousel>
      </div>

      <Button variant="default" size="xl" asChild>
        <Link href="/products">
          View All
        </Link>
      </Button>
    </section>
  )
}

export default ProductCarousel