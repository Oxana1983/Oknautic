"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptOffer, closeRequest } from "@/lib/rfq-actions";

export function AcceptOfferButton({ offerId, requestId }: { offerId: string; requestId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    const result = await acceptOffer(offerId, requestId);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div>
      <Button variant="primary" size="sm" loading={loading} onClick={handle} className="gap-1.5">
        <CheckCircle2 size={15} />
        Принять предложение
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function CloseRequestButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handle() {
    setLoading(true);
    await closeRequest(requestId);
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-navy-500">Закрыть запрос?</span>
        <Button variant="outline" size="sm" loading={loading} onClick={handle} className="text-red-500 border-red-200 hover:bg-red-50 text-xs px-2 py-1 h-auto">
          Да
        </Button>
        <button onClick={() => setConfirm(false)} className="text-xs text-navy-400 hover:text-navy-700">
          Отмена
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-xs text-navy-400 hover:text-red-500 transition-colors"
    >
      <X size={13} />
      Закрыть запрос
    </button>
  );
}
