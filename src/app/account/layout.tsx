import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/requests");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "Аккаунт";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-8 items-start">
        <AccountSidebar
          displayName={displayName}
          email={user.email ?? ""}
          role={profile?.role ?? "customer"}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
