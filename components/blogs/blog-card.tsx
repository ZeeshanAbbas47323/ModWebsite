import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Blog } from "@/services/blog.service";

export function BlogCard({ blog }: { blog: Blog }) {
  const date = new Date(blog.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col group">
      <div className="relative w-full aspect-[1.4] rounded-2xl overflow-hidden mb-5 bg-gray-100">
        {blog.featured_image ? (
          <Image
            src={blog.featured_image}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {blog.category && (
          <span className="absolute top-3 left-3 bg-[#C8E100] text-black text-xs font-semibold px-3 py-1 rounded-full">
            {blog.category}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-xs mb-2">{date}</p>
      <h3 className="font-bold text-lg md:text-xl text-black mb-2 line-clamp-2">
        {blog.title}
      </h3>
      <p className="text-gray-500 text-sm md:text-base mb-4 leading-relaxed line-clamp-3">
        {blog.excerpt}
      </p>
      <Link
        href={`/blogs/${blog.slug}`}
        className="text-black font-semibold text-sm md:text-base flex items-center mt-auto hover:underline w-fit"
      >
        Read More <ChevronRight className="w-4 h-4 ml-0.5" strokeWidth={3} />
      </Link>
    </div>
  );
}
