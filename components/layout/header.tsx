"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import SearchBar from "../shared/search-bar";
import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: settings } = useWebsiteSettings();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const phone = settings?.contact_phone ?? "+92 3123456789";
  const logoUrl = settings?.logo_black_url || settings?.logo_url || "/images/branding/logo-dark.svg";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button size="icon-lg" variant="ghost" onClick={() => setIsSidebarOpen(true)}>
              <Image src="/images/icons/3-bars.svg" alt="3-bars" width={24} height={24} />
            </Button>
            <div className="relative w-32 h-8 lg:w-48 lg:h-11">
              <Link href="/">
                <Image
                  src={logoUrl}
                  alt={settings?.site_name ?? "Modfirst Logo"}
                  fill
                  className="object-contain object-left"
                  priority
                  unoptimized={logoUrl.startsWith("http")}
                />
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-3xl px-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hidden lg:flex items-center gap-2 hover:opacity-75 transition-opacity">
              <Image src="/images/icons/phone.svg" alt="Phone" width={20} height={20} />
              <span className="text-sm font-medium whitespace-nowrap">{phone}</span>
            </a>

            <Button size="icon-lg" variant="ghost" asChild>
              <Link href={isAuthenticated ? "/account" : "/login"} aria-label={isAuthenticated ? "My account" : "Sign in"}>
                <Image src="/images/icons/user.svg" alt="" width={24} height={24} />
              </Link>
            </Button>

            <Button size="icon-lg" variant="ghost" asChild className="relative">
              <Link href="/cart" aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}>
                <Image src="/images/icons/cart.svg" alt="" width={24} height={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-black text-[11px] font-bold flex items-center justify-center leading-none">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        <div className="md:hidden px-4 pb-4">
          <SearchBar />
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
