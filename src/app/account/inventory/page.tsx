import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus, Upload, Package, CheckCircle2, XCircle, Pencil
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { InventoryUpload } from "@/components/seller/inventory-upload";
import { InventoryTable } from "@/components/seller/inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/inventory");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") redirect("/account/requests");

  const { data: items } = await supabase
    .from("seller_inventory")
    .select("*")
    .eq("seller_id", user.id)
    .order("product_name");

  const total = items?.length ?? 0;
  const inStock = items?.filter((i) => i.quantity > 0 && i.is_available).length ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-navy-900">Склад</h1>
          <p className="text-sm text-navy-400 mt-0.5">
            {total} позиций · {inStock} в наличии
          </p>
        </div>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Всего позиций" value={total} />
          <StatCard label="В наличии" value={inStock} green />
          <StatCard label="Нет в наличии" value={total - inStock} />
        </div>
      )}

      {/* Upload section */}
      <Card className="mb-6">
        <CardBody className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={16} className="text-navy-400" />
            <h2 className="font-display font-semibold text-navy-800">Загрузить прайс-лист</h2>
          </div>
          <InventoryUpload />
        </CardBody>
      </Card>

      {/* Inventory list */}
      {total === 0 ? (
        <Card>
          <CardBody className="py-16 flex flex-col items-center gap-3 text-center">
            <Package size={36} strokeWidth={1.2} className="text-navy-300" />
            <div>
              <p className="font-display font-semibold text-navy-600">Склад пуст</p>
              <p className="text-sm text-navy-400 mt-1">
                Загрузите CSV-файл с вашими позициями выше. Покупатели, чьи запросы совпадают с вашим SKU, увидят вас в приоритете.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <InventoryTable items={items ?? []} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, green }: { label: string; value: number; green?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-4">
      <p className={`text-2xl font-bold ${green ? "text-teal-600" : "text-navy-800"}`}>{value}</p>
      <p className="text-xs text-navy-400 mt-0.5">{label}</p>
    </div>
  );
}
