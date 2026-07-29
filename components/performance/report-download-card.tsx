"use client";

import { Download, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import type { PerformanceReport } from "@/types/performance";

interface ReportDownloadCardProps {
  report: PerformanceReport;
  onDownload?: (id: string) => void;
}

const REPORT_ICONS = {
  document: FileText,
  spreadsheet: FileSpreadsheet,
  shield: ShieldCheck,
} as const;

export function ReportDownloadCard({
  report,
  onDownload,
}: ReportDownloadCardProps) {
  const Icon = REPORT_ICONS[report.icon];

  const handleDownload = () => {
    onDownload?.(report.id);
    toast.success(
      `${report.title} download started (${report.fileType}, ${report.size})`,
    );
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{report.title}</p>
        <p className="text-xs text-slate-400">
          {report.period} • {report.fileType} ({report.size})
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-slate-400 hover:text-[#1B6EF3]"
        onClick={handleDownload}
        aria-label={`Download ${report.title}`}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ReportDownloadSectionProps {
  reports: PerformanceReport[];
  onDownload?: (id: string) => void;
  onRequestCustom: () => void;
}

export function ReportDownloadSection({
  reports,
  onDownload,
  onRequestCustom,
}: ReportDownloadSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Downloadable Compliance Reports
        </h2>
        <button
          type="button"
          onClick={onRequestCustom}
          className="text-sm font-medium text-[#1B6EF3] hover:underline"
        >
          Request Custom Report
        </button>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports available"
          description="Compliance reports will appear here once generated."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {reports.map((report) => (
            <ReportDownloadCard
              key={report.id}
              report={report}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
