"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText, Package, ChevronRight, MessageSquare,
  Trash2, Archive, ArchiveRestore,
  CheckSquare, Square, MinusSquare, AlertTriangle,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import {
  archiveBuyerRequests,
  deleteBuyerRequestsPermanently,
  restoreBuyerRequests,
} from "@/lib/buyer-request-actions";

export type BuyerRequestItem = {
  id: string;
  sku: string;
  product_name: string;
  product_photo: string | null;
  quantity: number;
  status: string;
  created_at: string;
  offerCount: number;
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "В обработке",
  completed:   "Завершён",
  closed:      "Закрыт",
};
const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-600",
  completed:   "bg-teal-50 text-teal-700",
  closed:      "bg-navy-100 text-navy-500",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  activeItems: BuyerRequestItem[];
  archiveItems: BuyerRequestItem[];
};

export function RequestsList({ activeItems: initActive, archiveItems: initArchive }: Props) {
  const [isArchive, setIsArchive] = useState(false);
  const [activeItems, setActiveItems] = useState<BuyerRequestItem[]>(initActive);
  const [archiveItems, setArchiveItems] = useState<BuyerRequestItem[]>(initArchive);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const items = isArchive ? archiveItems : activeItems;
  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && !allSelected;

  function switchTab(toArchive: boolean) {
    setIsArchive(toArchive);
    setSelected(new Set());
  }

  function toggleAll() {
    setSelected(allSelected || someSelected ? new Set() : new Set(items.map((i) => i.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleArchive(ids: string[]) {
    startTransition(async () => {
      const res = await archiveBuyerRequests(ids);
      if (res.error) { setError(res.error); return; }
      const moving = activeItems.filter((i) => ids.includes(i.id));
      setActiveItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setArchiveItems((prev) => [...moving, ...prev]);
      setSelected(new Set());
    });
  }

  function handleRestore(ids: string[]) {
    startTransition(async () => {
      const res = await restoreBuyerRequests(ids);
      if (res.error) { setError(res.error); return; }
      const moving = archiveItems.filter((i) => ids.includes(i.id));
      setArchiveItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setActiveItems((prev) => [...moving, ...prev]);
      setSelected(new Set());
    });
  }

  function confirmDelete() {
    if (!confirmDeleteIds) return;
    const ids = confirmDeleteIds;
    setConfirmDeleteIds(null);
    startTransition(async () => {
      const res = await deleteBuyerRequestsPermanently(ids);
      if (res.error) { setError(res.error); return; }
      if (isArchive) {
        setArchiveItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      } else {
        setActiveItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      }
      setSelected(new Set());
    });
  }

  return (
    <div className="space-y-4">
      {/* Confirm dialog */}
      {confirmDeleteIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-display font-semibold text-navy-900">
                  Удалить {confirmDeleteIds.length > 1 ? `${confirmDeleteIds.length} запроса` : "запрос"}?
                </p>
                <p className="text-sm text-navy-500 mt-1">
                  Это действие нельзя отменить. Запрос исчезнет навсегда.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteIds(null)}
                className="px-4 py-2 rounded-xl text-sm text-navy-600 hover:bg-navy-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Удалить навсегда
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex rounded-xl border border-navy-200 overflow-hidden text-sm">
          <button
            onClick={() => switchTab(false)}
            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
              !isArchive ? "bg-navy-800 text-white" : "text-navy-500 hover:bg-navy-50"
            }`}
          >
            Мои запросы
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              !isArchive ? "bg-white/20 text-white" : "bg-navy-100 text-navy-600"
            }`}>
              {activeItems.length}
            </span>
          </button>
          <button
            onClick={() => switchTab(true)}
            className={`px-3 py-1.5 flex items-center gap-1.5 border-l border-navy-200 transition-colors ${
              isArchive ? "bg-navy-800 text-white" : "text-navy-500 hover:bg-navy-50"
            }`}
          >
            <Archive size={13} />
            Архив
            {archiveItems.length > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                isArchive ? "bg-white/20 text-white" : "bg-navy-100 text-navy-600"
              }`}>
                {archiveItems.length}
              </span>
            )}
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {isArchive ? (
              <button
                onClick={() => handleRestore(Array.from(selected))}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 disabled:opacity-50 transition-colors"
              >
                <ArchiveRestore size={14} />
                Восстановить ({selected.size})
              </button>
            ) : (
              <button
                onClick={() => setConfirmDeleteIds(Array.from(selected))}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={14} />
                Удалить ({selected.size})
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">{error}</div>
      )}

      {items.length === 0 ? (
        <Card>
          <CardBody className="py-16 flex flex-col items-center gap-4 text-center">
            {isArchive ? (
              <>
                <Archive size={28} className="text-navy-300" strokeWidth={1.2} />
                <p className="text-sm text-navy-400">Архив пуст</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center">
                  <FileText size={24} strokeWidth={1.2} className="text-navy-300" />
                </div>
                <div>
                  <p className="font-display font-semibold text-navy-700 mb-1">Запросов пока нет</p>
                  <p className="text-sm text-navy-400">Добавьте товары в корзину и отправьте запрос цен</p>
                </div>
                <Link href="/catalog" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Перейти в каталог →
                </Link>
              </>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
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
              <div
                key={req.id}
                className={`flex items-center gap-2 rounded-2xl border transition-all ${
                  isSelected ? "border-teal-300 bg-teal-50/40" : "border-transparent"
                }`}
              >
                <button
                  onClick={() => toggleOne(req.id)}
                  className="pl-2 py-3 text-navy-400 hover:text-teal-500 transition-colors shrink-0"
                >
                  {isSelected
                    ? <CheckSquare size={18} className="text-teal-500" />
                    : <Square size={18} />
                  }
                </button>

                <Link href={`/account/requests/${req.id}`} className="flex-1 min-w-0">
                  <Card className={`hover:border-teal-200 hover:shadow-sm transition-all ${isSelected ? "border-transparent shadow-none" : ""}`}>
                    <CardBody className="p-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl border border-navy-100 bg-navy-50 relative overflow-hidden shrink-0">
                          {req.product_photo ? (
                            <Image src={req.product_photo} alt={req.product_name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-navy-300">
                              <Package size={16} strokeWidth={1.2} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-navy-800 leading-snug truncate">{req.product_name}</p>
                              <p className="text-xs font-mono text-navy-400">{req.sku}</p>
                            </div>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[req.status] ?? "bg-navy-100 text-navy-500"}`}>
                              {STATUS_LABEL[req.status] ?? req.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                            <span>Кол-во: <span className="text-navy-600 font-medium">{req.quantity}</span></span>
                            <span className="flex items-center gap-1">
                              <MessageSquare size={11} />
                              {req.offerCount > 0
                                ? <span className="text-teal-600 font-medium">{req.offerCount} предложений</span>
                                : "нет предложений"
                              }
                            </span>
                            <span className="ml-auto">{fmt(req.created_at)}</span>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-navy-300 shrink-0" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>

                {isArchive ? (
                  <button
                    onClick={() => handleRestore([req.id])}
                    disabled={isPending}
                    className="pr-1 flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-navy-400 hover:text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-40 shrink-0"
                  >
                    <ArchiveRestore size={14} />
                    Восстановить
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive([req.id])}
                    disabled={isPending}
                    className="pr-1 flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-navy-400 hover:text-navy-700 hover:bg-navy-100 transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Archive size={14} />
                    Архив
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
