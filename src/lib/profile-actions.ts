"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileInput = { first_name: string; last_name: string; phone: string };

export async function updateProfile(
  data: ProfileInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name.trim() || null,
      last_name: data.last_name.trim() || null,
      phone: data.phone.trim() || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account/profile");
  revalidatePath("/account");
  return {};
}

export async function switchRole(currentRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const newRole = currentRole === "seller" ? "customer" : "seller";

  await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect(newRole === "seller" ? "/account/incoming" : "/account/requests");
}
