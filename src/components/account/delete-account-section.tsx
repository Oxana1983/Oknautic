"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

export function DeleteAccountSection() {
  const t = useTranslations("profile");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);
    const result = await deleteAccount();
    if (result?.error) {
      setDeleting(false);
      setError(result.error);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-red-100">
      <p className="text-sm font-semibold text-red-600 mb-1">{t("dangerZone")}</p>
      <p className="text-xs text-navy-400 mb-3">{t("deleteAccountHint")}</p>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        <Trash2 size={14} />
        {t("deleteAccount")}
      </Button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4"
          onClick={() => !deleting && setConfirming(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <h2 className="font-display text-lg font-bold text-navy-900">
                {t("deleteAccountConfirmTitle")}
              </h2>
            </div>
            <p className="text-sm text-navy-500 mb-6">{t("deleteAccountConfirmBody")}</p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={handleConfirm}
                loading={deleting}
              >
                {t("deleteAccountConfirmButton")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && <Toast message={error} variant="error" onClose={() => setError(null)} />}
    </div>
  );
}
