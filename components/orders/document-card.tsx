"use client";

import { CheckCircle2, Download, ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GradeSpecs, OrderDocument } from "@/types/orders";

interface DocumentCardProps {
  documents: OrderDocument[];
  gradeSpecs: GradeSpecs;
  onDownload: (documentId: string) => void;
  onViewCoa?: () => void;
  className?: string;
}

export function DocumentCard({
  documents,
  gradeSpecs,
  onDownload,
  onViewCoa,
  className,
}: DocumentCardProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Grade Specifications
        </h4>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="bg-slate-50 px-3 py-2 text-slate-500">
                  Density
                </td>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {gradeSpecs.density}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="bg-slate-50 px-3 py-2 text-slate-500">
                  Melt Flow Rate
                </td>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {gradeSpecs.mfi}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-50 px-3 py-2 text-slate-500">
                  Application
                </td>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {gradeSpecs.application}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={onViewCoa}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B6EF3] hover:underline"
        >
          View COA
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Documentation
        </h4>
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate text-sm font-medium text-slate-800">
                  {doc.name}
                </span>
              </div>
              {doc.available ? (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-[#1B6EF3]" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500"
                    onClick={() => onDownload(doc.id)}
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wide text-red-500">
                  Pending
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
