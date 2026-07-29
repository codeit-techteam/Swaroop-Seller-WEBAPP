"use client";

import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface DispatchInstructionCardProps {
  instruction: string;
  className?: string;
}

export function DispatchInstructionCard({
  instruction,
  className,
}: DispatchInstructionCardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Dispatch Instructions
      </h4>
      <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50/80 px-3 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="text-sm leading-relaxed text-red-700">{instruction}</p>
      </div>
    </div>
  );
}
