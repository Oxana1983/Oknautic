"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Move to archive — reversible
export async function archiveRequests(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = requestIds.map((id) => ({
    seller_id: user.id,
    quote_request_id: id,
    is_permanent: false,
  }));

  const { error } = await supabase
    .from("seller_request_archive")
    .upsert(rows, { onConflict: "seller_id,quote_request_id" });

  if (error) return { error: error.message };
  revalidatePath("/account/incoming");
  return {};
}

// Permanent delete — irreversible
export async function deleteRequestsPermanently(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = requestIds.map((id) => ({
    seller_id: user.id,
    quote_request_id: id,
    is_permanent: true,
  }));

  const { error } = await supabase
    .from("seller_request_archive")
    .upsert(rows, { onConflict: "seller_id,quote_request_id" });

  if (error) return { error: error.message };
  revalidatePath("/account/incoming");
  return {};
}

// Restore from archive
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
