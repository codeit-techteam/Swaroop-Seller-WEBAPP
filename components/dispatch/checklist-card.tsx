"use client";

import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DispatchChecklistItem } from "@/types/dispatch";

interface ChecklistCardProps {
  items: DispatchChecklistItem[];
  className?: string;
}

export function ChecklistCard({ items, className }: ChecklistCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Operational Checklist
      </h4>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3">
            {item.status === "completed" ? (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </motion.span>
            ) : item.status === "in_progress" ? (
              <span className="flex h-5 w-5 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
              </span>
            ) : (
              <Circle className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                item.status === "completed"
                  ? "text-slate-800"
                  : item.status === "in_progress"
                    ? "text-teal-700"
                    : "text-slate-400",
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
