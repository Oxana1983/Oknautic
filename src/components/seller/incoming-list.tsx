"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package, ChevronRight, Archive, ArchiveRestore,
  Trash2, CheckSquare, Square, MinusSquare
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { archiveRequests, restoreRequests } from "@/lib/incoming-actions";

export type IncomingItem = {
  id: string;
  sku: string;
  product_name: string;
  product_photo: string | null;
  quantity: number;
  status: string;
  created_at: string;
  buyer_name?: string | null;
  additional_comment?: string | null;
  hasOffer: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "Активный",
  completed:   "Завершён",
  closed:      "Закрыт",
};
const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-600",
  completed:   "bg-navy-100 text-navy-500",
  closed:      "bg-navy-100 text-navy-400",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  items: IncomingItem[];
  isArchive: boolean;
  activeCount: number;
  archiveCount: number;
};

export function IncomingList({ items: initial, isArchive, activeCount, archiveCount }: Props) {
  const [items, setItems] = useState<IncomingItem[]>(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected || someSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBulkAction(ids: string[]) {
    startTransition(async () => {
      const res = isArchive
        ? await restoreRequests(ids)
        : await archiveRequests(ids);
      if (res.error) { setError(res.error); return; }
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl border border-navy-200 overflow-hidden text-sm">
            <button
              onClick={() => router.push("/account/incoming")}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                !isArchive ? "bg-navy-800 text-white" : "text-navy-500 hover:bg-navy-50"
              }`}
            >
              Входящие
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                !isArchive ? "bg-white/20 text-white" : "bg-navy-100 text-navy-600"
              }`}>
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => router.push("/account/incoming?view=archive")}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors border-l border-navy-200 ${
                isArchive ? "bg-navy-800 text-white" : "text-navy-500 hover:bg-navy-50"
              }`}
            >
              <Archive size={13} />
              Архив
              {archiveCount > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  isArchive ? "bg-white/20 text-white" : "bg-navy-100 text-navy-600"
                }`}>
                  {archiveCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bulk action */}
        {selected.size > 0 && (
          <button
            onClick={() => handleBulkAction(Array.from(selected))}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              isArchive
                ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            } disabled:opacity-50`}
          >
            {isArchive
              ? <><ArchiveRestore size={14} /> Восстановить ({selected.size})</>
              : <><Trash2 size={14} /> Игнорировать ({selected.size})</>
            }
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">{error}</div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            {isArchive
              ? <><Archive size={28} className="text-navy-300 mx-auto mb-3" strokeWidth={1.2} /><p className="text-sm text-navy-400">Архив пуст</p></>
              : <><Package size={28} className="text-navy-300 mx-auto mb-3" strokeWidth={1.2} /><p className="text-sm text-navy-400">Нет входящих запросов</p></>
            }
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select-all row */}
          <div className="flex items-center gap-3 px-1 py-1">
            <button
              onClick={toggleAll}
              className="text-navy-400 hover:text-navy-700 transition-colors shrink-0"
              aria-label="Выделить все"
            >
              {allSelected
                ? <CheckSquare size={18} className="text-teal-500" />
                : someSelected
                ? <MinusSquare size={18} className="text-navy-400" />
                : <Square size={18} />
              }
            </button>
            <span className="text-xs text-navy-400">
              {selected.size > 0 ? `Выбрано: ${selected.size}` : "Выделить все"}
            </span>
          </div>

          {items.map((req) => {
            const isSelected = selected.has(req.id);
            return (
              <div key={req.id} className={`flex items-center gap-2 rounded-2xl border transition-all ${
                isSelected ? "border-teal-300 bg-teal-50/40" : "border-transparent"
              }`}>
                {/* Checkbox */}
                <button
                  onClick={() => toggleOne(req.id)}
                  className="pl-2 py-3 text-navy-400 hover:text-teal-500 transition-colors shrink-0"
                  aria-label={`Выбрать ${req.product_name}`}
                >
                  {isSelected
                    ? <CheckSquare size={18} className="text-teal-500" />
                    : <Square size={18} />
                  }
                </button>

                {/* Card */}
                <Link href={`/account/incoming/${req.id}`} className="flex-1 min-w-0">
                  <Card className={`hover:border-teal-200 hover:shadow-sm transition-all ${isSelected ? "border-transparent shadow-none" : ""}`}>
                    <CardBody className="p-3">
                      <div className="flex gap-3 items-center">
                        {/* Product image */}
                        <div className="w-12 h-12 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                          {req.product_photo ? (
                            <Image src={req.product_photo} alt={req.product_name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                              <Package size={16} strokeWidth={1.2} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-navy-800 leading-snug truncate">{req.product_name}</p>
                              <p className="text-xs font-mono text-navy-400">{req.sku}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[req.status] ?? "bg-navy-100 text-navy-500"}`}>
                                {STATUS_LABEL[req.status] ?? req.status}
                              </span>
                              {req.hasOffer && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                                  Предложено
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                            <span>Кол-во: <span className="text-navy-600 font-medium">{req.quantity}</span></span>
                            {req.buyer_name && <span>{req.buyer_name}</span>}
                            <span className="ml-auto">{fmt(req.created_at)}</span>
                          </div>
                        </div>

                        <ChevronRight size={15} className="text-navy-300 shrink-0" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>

                {/* Per-row ignore/restore */}
                <button
                  onClick={() => handleBulkAction([req.id])}
                  disabled={isPending}
                  title={isArchive ? "Восстановить" : "Игнорировать"}
                  className={`pr-1 p-2 rounded-xl transition-colors disabled:opacity-40 shrink-0 ${
                    isArchive
                      ? "text-navy-300 hover:text-teal-500 hover:bg-teal-50"
                      : "text-navy-300 hover:text-red-400 hover:bg-red-50"
                  }`}
                >
                  {isArchive ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
