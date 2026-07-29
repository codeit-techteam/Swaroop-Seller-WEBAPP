"use client";

import { cn } from "@/lib/utils";

interface NotesCardProps {
  notes: string;
  className?: string;
}

export function NotesCard({ notes, className }: NotesCardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold text-slate-900">
        Procurement Notes
      </h4>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-sm italic leading-relaxed text-slate-600">{notes}</p>
      </div>
    </div>
  );
}
