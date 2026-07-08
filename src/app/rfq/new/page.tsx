import { createClient } from "@/lib/supabase/server";
import { RfqForm } from "@/components/rfq/rfq-form";

export default async function RfqNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let prefill: { name: string; email: string; phone: string } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .single();

    prefill = {
      name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "",
      email: user.email ?? "",
      phone: profile?.phone ?? "",
    };
  }

  return <RfqForm prefill={prefill} isAuthenticated={!!user} />;
}
