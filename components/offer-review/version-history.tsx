"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { OfferVersion } from "@/types/offer-review";

interface VersionHistoryProps {
  versions: OfferVersion[];
  className?: string;
}

export function VersionHistory({ versions, className }: VersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Version History
      </h4>
      <div className="space-y-0">
        {versions.map((version, index) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={cn(
              "relative flex items-center gap-3 border-l-2 py-2 pl-4",
              version.isLatest
                ? "border-[#1B6EF3] bg-[#F5F9FF]/60"
                : "border-slate-200",
            )}
          >
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  version.isLatest ? "text-[#1B6EF3]" : "text-slate-700",
                )}
              >
                V{version.version}: {version.label}
              </p>
              <p className="text-[11px] text-slate-400">
                {format(parseISO(version.timestamp), "MMM d, yyyy · HH:mm")}
              </p>
            </div>
            {version.isLatest ? (
              <span className="shrink-0 rounded-full bg-[#1B6EF3] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                Latest
              </span>
            ) : null}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
