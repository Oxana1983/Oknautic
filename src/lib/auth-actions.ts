"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

type AuthState = { error: string } | null;

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
  redirect("/");
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
        role: (formData.get("role") as string) ?? "customer",
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

  // Store consent fields on the profile (created synchronously by DB trigger)
  const userId = data?.user?.id;
  if (userId) {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();
    await adminSupabase.from("profiles").update({
      terms_accepted_at: formData.get("terms_accepted") === "on" ? now : null,
      seller_terms_accepted_at: formData.get("seller_terms_accepted") === "on" ? now : null,
      marketing_consent: formData.get("marketing_consent") === "on",
    }).eq("id", userId);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
