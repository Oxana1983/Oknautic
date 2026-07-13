"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, ShoppingBag, Store, X } from "lucide-react";
import { signUp } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";

function ConsentModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 shrink-0">
          <h2 className="font-display text-base font-bold text-navy-900">Consent to Personal Data Processing</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 text-sm text-navy-700 leading-relaxed space-y-4">
          <p>
            By ticking the box "I agree with processing of personal data" and creating an account, I confirm that I have read the{" "}
            <Link href="/privacy" className="text-teal-600 hover:text-teal-700 underline" onClick={onClose}>
              Privacy Policy
            </Link>{" "}
            of OKnautic.com, operated by Yacht Team DOO, Bonići 1, 85320 Tivat, Montenegro, and I consent to the processing of my personal data — including my name, contact details, and the contents of my quote requests (product, quantity, delivery location and delivery date/time) — for the purposes of:
          </p>
          <ul className="space-y-1.5 pl-0 list-none">
            {[
              "creating and managing my account;",
              "transmitting my quote requests to registered Sellers whose product range matches my request, and delivering their offers to me;",
              "enabling communication with Sellers through the Platform chat;",
              "sending me service notifications related to my requests and orders.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            I understand that the details of my quote requests, including the delivery location and date, will be made available to relevant Sellers, and that my name will become visible to a Seller when I start a chat with them or confirm their offer.
          </p>
          <p>
            I may withdraw this consent at any time by contacting{" "}
            <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>{" "}
            or deleting my account; withdrawal does not affect the lawfulness of processing carried out before withdrawal. Details of my rights and of data retention are set out in the{" "}
            <Link href="/privacy" className="text-teal-600 hover:text-teal-700 underline" onClick={onClose}>
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-navy-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-9 rounded-xl bg-navy-900 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const searchParams = useSearchParams();

  const rawName = searchParams.get("name") ?? "";
  const nameParts = rawName.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");

  const [state, action, isPending] = useActionState(signUp, null);
  const defaultRole = searchParams.get("role") === "seller" ? "seller" : "customer";
  const [role, setRole] = useState<"customer" | "seller">(defaultRole);
  const [showConsent, setShowConsent] = useState(false);

  return (
    <>
      {showConsent && <ConsentModal onClose={() => setShowConsent(false)} />}

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
            {", "}включая{" "}
            <button
              type="button"
              onClick={() => setShowConsent(true)}
              className="underline hover:text-navy-600 transition-colors"
            >
              обработку персональных данных
            </button>
          </p>
        </form>
      </div>
    </>
  );
}
