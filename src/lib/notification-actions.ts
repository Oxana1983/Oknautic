"use server";

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
