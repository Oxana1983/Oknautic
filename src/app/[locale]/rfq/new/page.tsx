import { createClient } from "@/lib/supabase/server";
import { RfqForm, type RfqPrefill } from "@/components/rfq/rfq-form";

export default async function RfqNewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let prefill: RfqPrefill | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, city, country, lat, lng")
      .eq("id", user.id)
      .single();

    prefill = {
      name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "",
      email: user.email ?? "",
      phone: profile?.phone ?? "",
      delivery:
        profile?.city && profile.country && profile.lat != null && profile.lng != null
          ? { city: profile.city, country: profile.country, lat: profile.lat, lng: profile.lng }
          : null,
    };
  }

  return <RfqForm prefill={prefill} isAuthenticated={!!user} />;
}
