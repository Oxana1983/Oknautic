"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function archiveRequests(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = requestIds.map((id) => ({
    seller_id: user.id,
    quote_request_id: id,
  }));

  const { error } = await supabase
    .from("seller_request_archive")
    .upsert(rows, { onConflict: "seller_id,quote_request_id" });

  if (error) return { error: error.message };
  revalidatePath("/account/incoming");
  return {};
}

export async function restoreRequests(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("seller_request_archive")
    .delete()
    .eq("seller_id", user.id)
    .in("quote_request_id", requestIds);

  if (error) return { error: error.message };
  revalidatePath("/account/incoming");
  return {};
}
