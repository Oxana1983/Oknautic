"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VariantGroup } from "@/lib/mock-data";

export function VariantPicker({ groups }: { groups: VariantGroup[] }) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((g) => [g.name, g.options[0].value]))
  );

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.name}>
          <p className="text-xs font-medium text-navy-500 mb-2 font-display">
            {group.name}:{" "}
            <span className="text-navy-800">
              {group.options.find((o) => o.value === selected[group.name])?.label}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setSelected((prev) => ({ ...prev, [group.name]: opt.value }))
                }
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                  selected[group.name] === opt.value
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-navy-200 text-navy-700 hover:border-navy-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
