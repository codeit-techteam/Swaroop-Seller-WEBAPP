"use client";

import { cn } from "@/lib/utils";
import {
  PROCUREMENT_PIPELINE,
  type ProcurementRecord,
  type ProcurementStage,
} from "@/types/seller-ops";

export function ProcurementPipeline({
  rows,
  active,
  onSelect,
}: {
  rows: ProcurementRecord[];
  active: ProcurementStage | "ALL";
  onSelect: (stage: ProcurementStage | "ALL") => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-[880px] items-stretch gap-2">
        {PROCUREMENT_PIPELINE.map((item, index) => {
          const count = rows.filter((row) => row.currentStage === item.stage).length;
          const selected = active === item.stage;
          return (
            <div key={item.stage} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect(selected ? "ALL" : item.stage)}
                className={cn(
                  "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-[#1B6EF3] bg-[#E8F1FF]"
                    : "border-slate-200 hover:bg-slate-50",
                )}
              >
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{count}</p>
              </button>
              {index < PROCUREMENT_PIPELINE.length - 1 ? (
                <span className="hidden text-slate-300 lg:inline">→</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
