"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

type AuthState = { error: string } | null;

// Back to where the user came from (e.g. /rfq/new with a full cart), in the
// current language. Only same-origin paths; "//evil.com" falls back to home.
async function redirectAfterAuth(formData: FormData): Promise<never> {
  const next = formData.get("next");
  const path = typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : "/";
  if (/^\/(ru|en|it)(\/|$)/.test(path)) redirect(path);
  const locale = await getLocale();
  redirect(path === "/" ? `/${locale}` : `/${locale}${path}`);
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) return { error: error.message };
  return redirectAfterAuth(formData);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        // handle_new_user also whitelists this; never let "admin" through
        role: formData.get("role") === "seller" ? "seller" : "customer",
      },
    },
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("email rate")) {
      return { error: "Слишком много попыток регистрации. Подождите несколько минут и попробуйте снова." };
    }
    if (msg.includes("already registered") || msg.includes("user already exists")) {
      return { error: "Пользователь с таким email уже зарегистрирован. Попробуйте войти." };
    }
    return { error: error.message };
  }

  // Supabase returns 200 with an empty `identities` array (no error) when the
  // email already belongs to a confirmed account — this avoids leaking which
  // emails are registered. Without this check the form silently redirects as
  // if signup succeeded, even though no session was actually created.
  if (data?.user?.identities?.length === 0) {
    return { error: "Этот email уже зарегистрирован и подтверждён. Войдите в свой аккаунт." };
  }

  // Store consent fields on the profile (created synchronously by DB trigger).
  // Only if not yet set: signUp on an existing unconfirmed email returns that
  // user too, and anyone could otherwise overwrite their consents.
  const userId = data?.user?.id;
  if (userId) {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();
    await adminSupabase.from("profiles").update({
      terms_accepted_at: formData.get("terms_accepted") === "on" ? now : null,
      seller_terms_accepted_at: formData.get("seller_terms_accepted") === "on" ? now : null,
      marketing_consent: formData.get("marketing_consent") === "on",
    }).eq("id", userId).is("terms_accepted_at", null);
  }

  return redirectAfterAuth(formData);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oknautic.com";

type ResetState = { error?: string; email?: string } | null;

export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${BASE_URL}/reset-password`,
  });
  if (error) return { error: error.message };
  return { email };
}

type UpdatePasswordState = { error?: string; success?: boolean } | null;

export async function updatePassword(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  if (password !== confirm) return { error: "mismatch" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAccount(): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cascades through profiles -> carts, quote_requests, offers, chats,
  // seller_inventory, etc. (all declared "on delete cascade" in 001_schema.sql).
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/");
}
