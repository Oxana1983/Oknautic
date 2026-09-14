"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "error" | "success";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, variant = "error", onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isError = variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-start gap-2.5 max-w-sm w-[calc(100%-2rem)] px-4 py-3 rounded-xl shadow-lg border",
        isError ? "bg-red-50 border-red-100 text-red-600" : "bg-teal-50 border-teal-100 text-teal-700"
      )}
    >
      <Icon size={16} className="shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
