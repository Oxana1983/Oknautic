"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function archiveBuyerRequests(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = requestIds.map((id) => ({
    buyer_id: user.id,
    quote_request_id: id,
    is_permanent: false,
  }));

  const { error } = await supabase
    .from("buyer_request_archive")
    .upsert(rows, { onConflict: "buyer_id,quote_request_id" });

  if (error) return { error: error.message };
  revalidatePath("/account/requests");
  return {};
}

export async function deleteBuyerRequestsPermanently(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = requestIds.map((id) => ({
    buyer_id: user.id,
    quote_request_id: id,
    is_permanent: true,
  }));

  const { error } = await supabase
    .from("buyer_request_archive")
    .upsert(rows, { onConflict: "buyer_id,quote_request_id" });

  if (error) return { error: error.message };
  revalidatePath("/account/requests");
  return {};
}

export async function restoreBuyerRequests(requestIds: string[]): Promise<{ error?: string }> {
  if (!requestIds.length) return {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("buyer_request_archive")
    .delete()
    .eq("buyer_id", user.id)
    .in("quote_request_id", requestIds);

  if (error) return { error: error.message };
  revalidatePath("/account/requests");
  return {};
}
