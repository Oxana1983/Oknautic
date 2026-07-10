"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { FileText, User, Store, LogOut, Warehouse, ArrowLeftRight } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { switchRole } from "@/lib/profile-actions";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Props = {
  displayName: string;
  email: string;
  role: string;
};

export function AccountSidebar({ displayName, email, role }: Props) {
  const t = useTranslations("account");
  const pathname = usePathname();

  const customerLinks = [
    { href: "/account/requests", label: t("myRequests"), icon: FileText },
    { href: "/account/profile",  label: t("profile"),    icon: User },
  ];

  const sellerLinks = [
    { href: "/account/incoming",  label: t("incoming"),   icon: Store },
    { href: "/account/offers",    label: t("offers"),     icon: FileText },
    { href: "/account/inventory", label: t("inventory"),  icon: Warehouse },
    { href: "/account/profile",   label: t("profile"),    icon: User },
  ];

  const links = role === "seller" ? sellerLinks : customerLinks;

  return (
    <>
      {/* Mobile: horizontal scrollable tab bar */}
      <nav className="md:hidden mb-5 -mx-4 border-b border-navy-100 bg-white">
        <div className="flex overflow-x-auto scrollbar-none px-4 gap-1 py-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors",
                  active
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-navy-600 hover:bg-navy-50"
                )}
              >
                <Icon size={14} className={active ? "text-teal-500" : "text-navy-400"} />
                {label}
              </Link>
            );
          })}
          <form action={switchRole.bind(null, role)} className="shrink-0">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-navy-500 hover:bg-navy-50 whitespace-nowrap transition-colors"
            >
              <ArrowLeftRight size={14} className="text-navy-400" />
              {role === "seller" ? t("switchToBuyer") : t("switchToSeller")}
            </button>
          </form>
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 whitespace-nowrap transition-colors"
            >
              <LogOut size={14} />
              {t("signOut")}
            </button>
          </form>
        </div>
      </nav>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden md:block w-56 shrink-0 sticky top-24">
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
              {role === "seller" ? t("switchToSeller") : t("switchToBuyer")}
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
              {role === "seller" ? t("switchToBuyerMode") : t("switchToSellerMode")}
            </button>
          </form>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              {t("signOut")}
            </button>
          </form>
        </nav>
      </aside>
    </>
  );
}
