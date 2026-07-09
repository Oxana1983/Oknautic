"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, User, Store, LogOut, Warehouse, ArrowLeftRight } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { switchRole } from "@/lib/profile-actions";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
  email: string;
  role: string;
};

export function AccountSidebar({ displayName, email, role }: Props) {
  const pathname = usePathname();

  const customerLinks = [
    { href: "/account/requests", label: "Мои запросы", icon: FileText },
    { href: "/account/profile",  label: "Профиль",     icon: User },
  ];

  const sellerLinks = [
    { href: "/account/incoming",  label: "Входящие запросы", icon: Store },
    { href: "/account/offers",    label: "Мои предложения",  icon: FileText },
    { href: "/account/inventory", label: "Склад",             icon: Warehouse },
    { href: "/account/profile",   label: "Профиль",           icon: User },
  ];

  const links = role === "seller" ? sellerLinks : customerLinks;

  return (
    <aside className="w-56 shrink-0 sticky top-24">
      {/* User card */}
      <div className="bg-white rounded-2xl border border-navy-100 p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            {displayName[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-800 truncate">{displayName}</p>
            <p className="text-[11px] text-navy-400 truncate">{email}</p>
          </div>
        </div>
        <div className="mt-2 px-1">
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            role === "seller"
              ? "bg-gold-100 text-gold-700"
              : "bg-teal-50 text-teal-700"
          )}>
            {role === "seller" ? "Продавец" : "Покупатель"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white rounded-2xl border border-navy-100 overflow-hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-navy-50 last:border-0",
                active
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-navy-600 hover:bg-navy-50"
              )}
            >
              <Icon size={16} className={active ? "text-teal-500" : "text-navy-400"} />
              {label}
            </Link>
          );
        })}
        <form action={switchRole.bind(null, role)}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-500 hover:bg-navy-50 transition-colors border-b border-navy-50"
          >
            <ArrowLeftRight size={16} className="text-navy-400" />
            {role === "seller" ? "Режим покупателя" : "Режим продавца"}
          </button>
        </form>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </form>
      </nav>
    </aside>
  );
}
