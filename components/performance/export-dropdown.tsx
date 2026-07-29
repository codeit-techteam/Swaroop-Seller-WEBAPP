"use client";

import { Download } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/types/performance";

interface PerformanceExportDropdownProps {
  label?: string;
  onExport?: (format: ExportFormat) => void;
  className?: string;
}

export function PerformanceExportDropdown({
  label = "Export Data",
  onExport,
  className,
}: PerformanceExportDropdownProps) {
  const formats: ExportFormat[] = ["CSV", "Excel", "PDF"];

  const handleExport = (format: ExportFormat) => {
    onExport?.(format);
    toast.success(`${format} export started (mock download)`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "gap-2 bg-[#0B1F3A] text-white hover:bg-[#122846]",
            className,
          )}
        >
          <Download className="h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
            Download {format}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
