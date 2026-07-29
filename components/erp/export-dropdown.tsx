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

interface ExportDropdownProps {
  label?: string;
  formats?: Array<"PDF" | "Excel" | "CSV">;
  className?: string;
  variant?: "default" | "outline" | "dark";
}

export function ExportDropdown({
  label = "Export Report",
  formats = ["PDF", "Excel", "CSV"],
  className,
  variant = "dark",
}: ExportDropdownProps) {
  const handleExport = (format: string) => {
    toast.success(`${format} export started (mock download)`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "gap-2",
            variant === "dark" && "bg-[#0B1F3A] text-white hover:bg-[#122846]",
            variant === "outline" &&
              "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            className,
          )}
          variant={variant === "outline" ? "outline" : "default"}
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
