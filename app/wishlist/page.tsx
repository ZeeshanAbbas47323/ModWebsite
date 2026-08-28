import { WishlistPage } from "@/components/wishlist/wishlist-page";

export const metadata = { title: "Wishlist | Modfirst Apparel" };

export default function Page() {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      <WishlistPage />
    </main>
  );
}
