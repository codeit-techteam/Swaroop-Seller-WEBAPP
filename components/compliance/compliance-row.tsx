"use client";

import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  Download,
  Eye,
  MoreVertical,
  RefreshCw,
  Upload,
} from "lucide-react";

import { StatusBadge } from "@/components/compliance/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  formatComplianceLastUpdated,
  getExpiryAlertLevel,
} from "@/lib/utils/compliance";
import type { ComplianceDocument } from "@/types/compliance";

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return format(parseISO(value), "MMM d, yyyy");
}

interface ComplianceRowProps {
  document: ComplianceDocument;
  active: boolean;
  onOpen: () => void;
  onView: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onFastTrack: () => void;
}

export function ComplianceRow({
  document,
  active,
  onOpen,
  onView,
  onUpload,
  onDownload,
  onPreview,
  onFastTrack,
}: ComplianceRowProps) {
  const isExpired = document.status === "expired";
  const isExpiring = document.status === "expiring_soon";
  const needsUpload = isExpired || isExpiring || document.status === "rejected";
  const expiryAlert = getExpiryAlertLevel(document.daysUntilExpiry);

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors hover:bg-slate-50/80",
        active && "bg-[#F5F9FF] ring-1 ring-inset ring-[#1B6EF3]/30",
        isExpired && "bg-red-50/40",
        expiryAlert === "critical" &&
          !isExpired &&
          "bg-orange-50/30 ring-1 ring-inset ring-orange-200/60",
        expiryAlert === "warning" && "bg-amber-50/20",
      )}
      onClick={onOpen}
    >
      <TableCell>
        <div className="flex items-start gap-2">
          {isExpiring || expiryAlert === "critical" ? (
            <AlertTriangle
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                isExpired ? "text-red-500" : "text-orange-500",
              )}
            />
          ) : null}
          <div>
            <p
              className={cn(
                "font-semibold",
                isExpired ? "text-red-600" : "text-slate-800",
              )}
            >
              {document.name}
            </p>
            <p className="text-xs text-slate-400">{document.documentNumber}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={document.status} />
      </TableCell>
      <TableCell
        className={cn(
          "tabular-nums",
          isExpired && "font-medium text-red-600",
          isExpiring && "font-medium text-orange-600",
          !isExpired && !isExpiring && "text-slate-600",
        )}
      >
        {formatDate(document.expiryDate)}
      </TableCell>
      <TableCell className="font-mono text-xs text-slate-600">
        {document.verifiedBy ?? "—"}
      </TableCell>
      <TableCell className="text-slate-600">
        <span className="block font-medium text-slate-800">
          {formatComplianceLastUpdated(document.lastUpdated)}
        </span>
        <span className="text-xs text-slate-400">
          {formatDate(document.lastUpdated)}
        </span>
      </TableCell>
      <TableCell onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onView}
            title="View details"
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
          {needsUpload ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isExpired
                  ? "text-red-600 hover:text-red-700"
                  : "text-[#1B6EF3] hover:text-[#1558C8]",
              )}
              onClick={onUpload}
              title="Upload new version"
            >
              {isExpired ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPreview}
              title="Preview"
            >
              <Eye className="h-4 w-4 text-slate-400" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={onPreview}>Preview</DropdownMenuItem>
              <DropdownMenuItem onClick={onDownload}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUpload}>
                Upload New Version
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onFastTrack}>
                Request Fast-Track
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
