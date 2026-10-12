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

export type UnreadCounts = {
  /** seller: unopened incoming requests (same filter as the Incoming list) */
  incoming: number;
  /** seller: offers accepted since the Offers page was last opened */
  accepted: number;
  /** buyer: offers received since My Requests was last opened */
  offers: number;
};

const NO_COUNTS: UnreadCounts = { incoming: 0, accepted: 0, offers: 0 };

// Single source of truth for the header bell and the account sidebar badges
export async function getUnreadCounts(): Promise<UnreadCounts> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NO_COUNTS;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, inbox_read_at, accepted_read_at, offers_read_at")
    .eq("id", user.id)
    .single();
  if (!profile) return NO_COUNTS;

  if (profile.role === "seller") {
    const [incoming, accepted] = await Promise.all([
      countUnreadIncoming(supabase, user.id, profile.inbox_read_at),
      countSince(
        supabase.from("offers").select("id", { count: "exact", head: true })
          .eq("seller_id", user.id)
          .eq("status", "accepted"),
        "updated_at",
        profile.accepted_read_at
      ),
    ]);
    return { incoming, accepted, offers: 0 };
  }

  // Offers on the buyer's own, non-archived requests. The inner join keeps
  // out the user's own offers from seller mode (visible via "seller own").
  const { data: archived } = await supabase
    .from("buyer_request_archive")
    .select("quote_request_id")
    .eq("buyer_id", user.id);
  let offersQuery = supabase
    .from("offers")
    .select("id, quote_requests!inner(customer_id)", { count: "exact", head: true })
    .eq("quote_requests.customer_id", user.id)
    .neq("status", "withdrawn");
  const archivedIds = (archived ?? []).map((a) => a.quote_request_id);
  if (archivedIds.length > 0) {
    offersQuery = offersQuery.not("quote_request_id", "in", `(${archivedIds.join(",")})`);
  }
  const offers = await countSince(offersQuery, "created_at", profile.offers_read_at);
  return { incoming: 0, accepted: 0, offers };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

// readAt null = never opened → everything counts
async function countSince<Q extends { gt: (col: string, v: string) => Q } & PromiseLike<{ count: number | null }>>(
  query: Q,
  column: string,
  readAt: string | null
): Promise<number> {
  const { count } = await (readAt ? query.gt(column, readAt) : query);
  return count ?? 0;
}

async function countUnreadIncoming(
  supabase: Supabase,
  sellerId: string,
  inboxReadAt: string | null
): Promise<number> {
  const [{ data: inventory }, { data: routed }, { data: archived }, { data: reads }] =
    await Promise.all([
      supabase.from("seller_inventory").select("sku, product_id").eq("seller_id", sellerId),
      supabase.rpc("get_seller_quote_requests"),
      supabase.from("seller_request_archive").select("quote_request_id").eq("seller_id", sellerId),
      supabase.from("seller_request_reads").select("quote_request_id").eq("seller_id", sellerId),
    ]);

  const skus = new Set((inventory ?? []).map((i) => i.sku));
  const productIds = new Set((inventory ?? []).map((i) => i.product_id).filter(Boolean));
  const hidden = new Set([
    ...(archived ?? []).map((a) => a.quote_request_id),
    ...(reads ?? []).map((r) => r.quote_request_id),
  ]);
  const baseline = inboxReadAt ? new Date(inboxReadAt) : null;

  return (routed ?? []).filter(
    (r) =>
      r.status === "in_progress" &&
      !hidden.has(r.id) &&
      (skus.has(r.sku) || (!!r.product_id && productIds.has(r.product_id))) &&
      // Legacy baseline: requests before inbox_read_at count as seen
      (!baseline || new Date(r.created_at) > baseline)
  ).length;
}
