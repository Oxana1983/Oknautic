"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, User, Menu, X, ChevronDown, Search, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { signOut } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";
import { SellerBell } from "@/components/seller/seller-bell";
import { BuyerBell } from "@/components/buyer/buyer-bell";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const CATEGORIES = [
  { slug: "navigation",     label: "Навигация" },
  { slug: "anchoring",      label: "Якорное" },
  { slug: "deck-hardware",  label: "Палуба" },
  { slug: "mooring",        label: "Швартовка" },
  { slug: "engines",        label: "Двигатели" },
  { slug: "electrical",     label: "Электрика" },
  { slug: "safety",         label: "Безопасность" },
  { slug: "rigging",        label: "Такелаж" },
];

export function Header({ user, role = "customer" }: { user: SupabaseUser | null; role?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, openCart } = useCart();
  const isSeller = role === "seller";
  const pathname = usePathname();
  const router = useRouter();
  const navGuard = useRef(false);

  // Clear search input on navigation
  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
    setSearchOpen(false);
  }

  // Close all menus on route change and block clicks briefly (prevents ghost-click after login redirect)
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    navGuard.current = true;
    const t = setTimeout(() => { navGuard.current = false; }, 300);
    return () => clearTimeout(t);
  }, [pathname]);

  const displayName = user?.user_metadata?.first_name
    ?? user?.email?.split("@")[0]
    ?? "Аккаунт";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-navy-100 shadow-[0_1px_4px_0_rgba(11,30,53,0.06)]">
        {/* Main row */}
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="OKnautic"
              width={120}
              height={49}
              priority
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, SKU или бренду..."
                className="w-full h-9 pl-9 pr-4 rounded-lg border border-navy-200 bg-navy-50 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:bg-white transition"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Mobile search toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Поиск"
            >
              <Search size={20} />
            </button>

            {/* Notification bell */}
            {user && isSeller && <SellerBell />}
            {user && !isSeller && <BuyerBell />}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
              aria-label="Корзина"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => { if (!navGuard.current) setUserMenuOpen((v) => !v); }}
                  className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl border border-navy-200 text-sm font-medium text-navy-700 hover:bg-navy-50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                  {displayName}
                  <ChevronDown size={14} className={cn("transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {/* xs: just icon */}
                <button
                  onClick={() => { if (!navGuard.current) setUserMenuOpen((v) => !v); }}
                  className="sm:hidden p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
                  aria-label="Аккаунт"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-navy-100 shadow-lg z-40 py-1 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-navy-100">
                        <p className="text-xs font-medium text-navy-800 truncate">{displayName}</p>
                        <p className="text-[11px] text-navy-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <FileText size={15} className="text-navy-400" />
                        {isSeller ? "Кабинет продавца" : "Мои запросы"}
                      </Link>
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Выйти
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Войти</Link>
                  </Button>
                  <Button variant="primary" size="sm" asChild>
                    <Link href="/register">Регистрация</Link>
                  </Button>
                </div>
                <Link
                  href="/login"
                  className="sm:hidden p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
                  aria-label="Войти"
                >
                  <User size={20} />
                </Link>
              </>
            )}

            {/* Burger */}
            <button
              className="lg:hidden p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-navy-100 px-4 py-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg border border-navy-200 bg-navy-50 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                />
              </div>
            </form>
          </div>
        )}

        {/* Desktop category nav */}
        <nav className="hidden lg:block border-t border-navy-100 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <ul className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog/${cat.slug}`}
                    className="flex items-center gap-1 px-3 h-10 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded transition-colors whitespace-nowrap"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li className="ml-2">
                <Link
                  href="/catalog"
                  className="flex items-center gap-1 px-3 h-10 text-sm font-medium text-teal-600 hover:text-teal-700 rounded transition-colors whitespace-nowrap"
                >
                  Все категории
                  <ChevronDown size={14} />
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={cn(
            "lg:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col",
            "transform transition-transform duration-200"
          )}>
            <div className="flex items-center justify-between px-5 h-16 border-b border-navy-100">
              <span className="font-display font-semibold text-navy-800">Меню</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-50"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              <p className="px-5 text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">
                Категории
              </p>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/catalog/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-5 py-2.5 text-sm text-navy-700 hover:bg-navy-50 hover:text-navy-900 transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/catalog"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-5 py-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50"
              >
                Все категории →
              </Link>

              <div className="my-3 border-t border-navy-100" />

              <p className="px-5 text-xs font-medium text-navy-400 uppercase tracking-wider mb-1">
                Аккаунт
              </p>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-5 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
              >
                {isSeller ? "Кабинет продавца" : "Мои запросы"}
              </Link>
            </nav>

            <div className="p-4 border-t border-navy-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-1 pb-2">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-bold shrink-0">
                      {displayName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{displayName}</p>
                      <p className="text-xs text-navy-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <form action={signOut}>
                    <Button type="submit" variant="outline" size="md" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut size={15} />
                      Выйти
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button variant="primary" size="md" asChild>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      Регистрация
                    </Link>
                  </Button>
                  <Button variant="outline" size="md" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Войти
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
