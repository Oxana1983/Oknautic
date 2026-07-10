import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";
import { ProfileForm } from "@/components/account/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, role")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-navy-900 mb-6">{t("title")}</h1>
      <Card className="max-w-lg">
        <CardBody className="p-6">
          <ProfileForm
            email={user.email ?? ""}
            initialData={{
              first_name: profile?.first_name ?? "",
              last_name: profile?.last_name ?? "",
              phone: profile?.phone ?? "",
              role: profile?.role ?? "customer",
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
