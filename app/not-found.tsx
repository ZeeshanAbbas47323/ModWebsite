import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Site-wide 404. Without this Next falls back to its own bare default —
 * outside the app's styling, no way back to the storefront — which is what
 * a broken menu link or an unmatched collection slug landed on.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold tracking-wide text-[#8a8a8a] uppercase">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-black sm:text-5xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-md text-base text-gray-600">
        The page you&apos;re looking for may have been moved, renamed, or never
        existed. Try searching for what you need, or head back home.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button size="xl" asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button size="xl" variant="outline" asChild>
          <Link href="/products">
            <Search className="size-4" />
            Browse products
          </Link>
        </Button>
      </div>
    </main>
  );
}
