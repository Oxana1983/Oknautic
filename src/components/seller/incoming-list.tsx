"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Package, ChevronRight, Trash2, Archive, ArchiveRestore,
  CheckSquare, Square, MinusSquare, AlertTriangle
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { archiveRequests, deleteRequestsPermanently, restoreRequests } from "@/lib/incoming-actions";

export type IncomingItem = {
  id: string;
  sku: string;
  product_name: string;
  product_photo: string | null;
  quantity: number;
  status: string;
  created_at: string;
  buyer_name?: string | null;
  hasOffer: boolean;
  isNew: boolean;
};

const STATUS_STYLE: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-600",
  completed:   "bg-navy-100 text-navy-500",
  closed:      "bg-navy-100 text-navy-400",
};

type Props = {
  activeItems: IncomingItem[];
  archiveItems: IncomingItem[];
  defaultIsArchive?: boolean;
};

export function IncomingList({ activeItems: initActive, archiveItems: initArchive, defaultIsArchive = false }: Props) {
  const t = useTranslations("incoming");
  const locale = useLocale();

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  }

  const STATUS_LABEL: Record<string, string> = {
    in_progress: t("statusActive"),
    completed:   t("statusCompleted"),
    closed:      t("statusClosed"),
  };

  const [isArchive, setIsArchive] = useState(defaultIsArchive);
  const [activeItems, setActiveItems] = useState<IncomingItem[]>(initActive);
  const [archiveItems, setArchiveItems] = useState<IncomingItem[]>(initArchive);

  function markRead(id: string) {
    setActiveItems((prev) => prev.map((i) => i.id === id ? { ...i, isNew: false } : i));
  }
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
      const res = await archiveRequests(ids);
      if (res.error) { setError(res.error); return; }
      const moving = activeItems.filter((i) => ids.includes(i.id));
      setActiveItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setArchiveItems((prev) => [...moving, ...prev]);
      setSelected(new Set());
    });
  }

  function handleRestore(ids: string[]) {
    startTransition(async () => {
      const res = await restoreRequests(ids);
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
      const res = await deleteRequestsPermanently(ids);
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
      {/* Confirm permanent delete dialog */}
      {confirmDeleteIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-display font-semibold text-navy-900">
                  {t("deleteConfirmTitle", { count: confirmDeleteIds.length })}
                </p>
                <p className="text-sm text-navy-500 mt-1">
                  {t("deleteConfirmDesc")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteIds(null)}
                className="px-4 py-2 rounded-xl text-sm text-navy-600 hover:bg-navy-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {t("deleteBtn")}
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
            {t("tab")}
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
            {t("archive")}
            {archiveItems.length > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                isArchive ? "bg-white/20 text-white" : "bg-navy-100 text-navy-600"
              }`}>
                {archiveItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {isArchive ? (
              <button
                onClick={() => handleRestore(Array.from(selected))}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 disabled:opacity-50 transition-colors"
              >
                <ArchiveRestore size={14} />
                {t("restore", { count: selected.size })}
              </button>
            ) : (
              <button
                onClick={() => setConfirmDeleteIds(Array.from(selected))}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={14} />
                {t("deleteSelected", { count: selected.size })}
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
          <CardBody className="py-16 text-center">
            {isArchive
              ? <><Archive size={28} className="text-navy-300 mx-auto mb-3" strokeWidth={1.2} /><p className="text-sm text-navy-400">{t("archiveEmpty")}</p></>
              : <><Package size={28} className="text-navy-300 mx-auto mb-3" strokeWidth={1.2} /><p className="text-sm text-navy-400">{t("empty")}</p></>
            }
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select-all */}
          <div className="flex items-center gap-3 px-1 py-1">
            <button
              onClick={toggleAll}
              className="text-navy-400 hover:text-navy-700 transition-colors shrink-0"
              aria-label={t("selectAll")}
            >
              {allSelected
                ? <CheckSquare size={18} className="text-teal-500" />
                : someSelected
                ? <MinusSquare size={18} className="text-navy-400" />
                : <Square size={18} />
              }
            </button>
            <span className="text-xs text-navy-400">
              {selected.size > 0 ? t("selectedCount", { count: selected.size }) : t("selectAll")}
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
                >
                  {isSelected
                    ? <CheckSquare size={18} className="text-teal-500" />
                    : <Square size={18} />
                  }
                </button>

                {/* Card */}
                <Link href={`/account/incoming/${req.id}`} className="flex-1 min-w-0" onClick={() => markRead(req.id)}>
                  <Card className={`hover:border-teal-200 hover:shadow-sm transition-all ${
                    isSelected ? "border-transparent shadow-none" : req.isNew ? "border-blue-200 bg-blue-50/30" : ""
                  }`}>
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
                              <p className={`text-sm leading-snug truncate ${req.isNew ? "font-bold text-navy-900" : "font-semibold text-navy-800"}`}>
                                {req.product_name}
                              </p>
                              <p className="text-xs font-mono text-navy-400">{req.sku}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {req.isNew && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                  {t("badgeNew")}
                                </span>
                              )}
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[req.status] ?? "bg-navy-100 text-navy-500"}`}>
                                {STATUS_LABEL[req.status] ?? req.status}
                              </span>
                              {req.hasOffer && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                                  {t("badgeOffered")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                            <span>{t("qty")} <span className="text-navy-600 font-medium">{req.quantity}</span></span>
                            {req.buyer_name && <span>{req.buyer_name}</span>}
                            <span className="ml-auto">{fmt(req.created_at)}</span>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-navy-300 shrink-0" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>

                {/* Per-row right action */}
                {isArchive ? (
                  <button
                    onClick={() => handleRestore([req.id])}
                    disabled={isPending}
                    className="pr-1 flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-navy-400 hover:text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-40 shrink-0"
                  >
                    <ArchiveRestore size={14} />
                    <span className="hidden sm:inline">{t("restoreOne")}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive([req.id])}
                    disabled={isPending}
                    className="pr-1 flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-navy-400 hover:text-navy-700 hover:bg-navy-100 transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Archive size={14} />
                    <span className="hidden sm:inline">{t("archiveAction")}</span>
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
