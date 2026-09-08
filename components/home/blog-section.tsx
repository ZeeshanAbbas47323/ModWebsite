"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useHomeSection } from "@/hooks/use-home-section";
import { useBlogs } from "@/hooks/use-blogs";
import { BlogCard } from "@/components/blogs/blog-card";

export function BlogSection() {
  const { data: section, isLoading: sectionLoading } =
    useHomeSection("home_blog");
  const { data: blogsData, isLoading: blogsLoading } = useBlogs({
    page: 1,
    limit: 8,
  });

  const title = section?.title?.trim() || "Blog";
  const titleColor =
    section?.section_settings?.title_color?.trim() || "#000000";
  const titleAlign =
    section?.section_settings?.title_align?.trim() || "center";
  const blogs = blogsData?.payload ?? [];

  const isLoading = sectionLoading || blogsLoading;

  return (
    <section className="container pt-10 md:pt-12 lg:pt-16 flex flex-col items-center">
      <h2
        className="w-full text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-10 tracking-tight"
        style={{
          color: titleColor,
          textAlign: titleAlign as "center" | "left" | "right",
        }}
      >
        {title}
      </h2>

      {isLoading ? (
        <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="w-full aspect-[1.4] rounded-2xl bg-gray-200" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No blogs found.</p>
      ) : (
        <>
          <div className="w-full relative mb-6 md:mb-10">
            <Carousel opts={{ align: "start", loop: blogs.length > 3 }} className="w-full">
              <CarouselContent className="md:-ml-6">
                {blogs.map((blog) => (
                  <CarouselItem
                    key={blog.id}
                    className="md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <BlogCard blog={blog} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {blogs.length > 3 && (
                <>
                  <CarouselPrevious className="hidden md:flex top-[40%] -left-4 lg:-left-5 bg-white hover:bg-white border-white h-10 w-10 shadow-md" />
                  <CarouselNext className="hidden md:flex top-[40%] -right-4 lg:-right-5 border-white hover:bg-white h-10 w-10 shadow-md" />
                </>
              )}
            </Carousel>
          </div>

          <Button variant="default" size="xl" asChild>
            <Link href="/blogs">View All</Link>
          </Button>
        </>
      )}
    </section>
  );
}
