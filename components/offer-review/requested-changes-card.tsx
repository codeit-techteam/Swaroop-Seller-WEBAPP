"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestedChange } from "@/types/offer-review";

interface RequestedChangesCardProps {
  changes: RequestedChange[];
  className?: string;
}

export function RequestedChangesCard({
  changes,
  className,
}: RequestedChangesCardProps) {
  if (changes.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Requested Changes
      </h4>
      <div className="space-y-3">
        {changes.map((change, index) => (
          <motion.div
            key={change.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-xl border border-red-200 bg-red-50/40 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                Field: {change.field}
              </p>
              {change.actionRequired ? (
                <Badge className="bg-red-600 text-[10px] uppercase hover:bg-red-600">
                  Action Required
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Current Value
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {change.currentValue}
                </p>
              </div>
              {change.marketCeiling ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Market Ceiling
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-red-600">
                    {change.marketCeiling}
                  </p>
                </div>
              ) : change.expectedValue ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    Expected Value
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                    {change.expectedValue}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
