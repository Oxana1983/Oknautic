"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, ShoppingBag, Store } from "lucide-react";
import { signUp } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

export function RegisterForm() {
  const searchParams = useSearchParams();

  // Pre-fill from RFQ form or URL params
  const rawName = searchParams.get("name") ?? "";
  const nameParts = rawName.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");

  const [state, action, isPending] = useActionState(signUp, null);
  const [role, setRole] = useState<"customer" | "seller">("customer");

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8">
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Регистрация</h1>
      <p className="text-sm text-navy-500 mb-6">Создайте аккаунт OKnautic</p>

      {state?.error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 mb-5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <form action={action} className="space-y-4">
        {/* Role picker */}
        <div>
          <p className="text-xs font-medium text-navy-600 mb-2">Тип аккаунта</p>
          <div className="grid grid-cols-2 gap-3">
            {(["customer", "seller"] as const).map((r) => {
              const isActive = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-navy-200 text-navy-600 hover:border-navy-400"
                  }`}
                >
                  {r === "customer"
                    ? <ShoppingBag size={20} className={isActive ? "text-teal-500" : "text-navy-400"} />
                    : <Store size={20} className={isActive ? "text-teal-500" : "text-navy-400"} />
                  }
                  {r === "customer" ? "Покупатель" : "Продавец"}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
              <User size={12} />Имя
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="Иван"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-xs font-medium text-navy-600 mb-1.5">
              Фамилия
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="Иванов"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
            <Mail size={12} />Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ivan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium text-navy-600 mb-1.5">
            <Lock size={12} />Пароль * <span className="text-navy-400 font-normal">(минимум 6 символов)</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputCls}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={isPending}
        >
          {isPending ? "Создаём аккаунт..." : "Создать аккаунт"}
        </Button>

        <p className="text-[11px] text-navy-400 text-center leading-relaxed">
          Регистрируясь, вы соглашаетесь с{" "}
          <Link href="/terms" className="underline hover:text-navy-600">условиями использования</Link>
          {" "}и{" "}
          <Link href="/privacy" className="underline hover:text-navy-600">политикой конфиденциальности</Link>
        </p>
      </form>
    </div>
  );
}
