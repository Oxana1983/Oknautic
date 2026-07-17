"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markInboxRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ inbox_read_at: new Date().toISOString() })
    .eq("id", user.id);
}

export async function markOffersRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ offers_read_at: new Date().toISOString() })
    .eq("id", user.id);
}

export async function markAcceptedRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ accepted_read_at: new Date().toISOString() })
    .eq("id", user.id);
}

export async function markRequestRead(requestId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("seller_request_reads" as any)
    .upsert(
      { seller_id: user.id, quote_request_id: requestId },
      { onConflict: "seller_id,quote_request_id" }
    );
}
