"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CatalogFilters } from "./filters";
import { Button } from "@/components/ui/button";

export function MobileFiltersButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SlidersHorizontal size={15} />
        Фильтры
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
              <span className="font-display font-semibold text-navy-800">Фильтры</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4" onClick={() => setOpen(false)}>
              <CatalogFilters />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
