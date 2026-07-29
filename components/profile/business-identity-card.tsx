"use client";

import { motion } from "framer-motion";
import { Building2, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BusinessIdentity } from "@/types/profile";

interface BusinessIdentityCardProps {
  identity: BusinessIdentity;
  onViewDocument: (field: "gstin" | "pan" | "cin") => void;
  onCopy: (field: "gstin" | "pan" | "cin", value: string) => void;
  className?: string;
}

const FIELDS: Array<{
  key: "gstin" | "pan" | "cin";
  label: string;
}> = [
  { key: "gstin", label: "GSTIN" },
  { key: "pan", label: "PAN" },
  { key: "cin", label: "CIN" },
];

export function BusinessIdentityCard({
  identity,
  onViewDocument,
  onCopy,
  className,
}: BusinessIdentityCardProps) {
  const handleCopy = (key: "gstin" | "pan" | "cin", value: string) => {
    onCopy(key, value);
    toast.success(`${key.toUpperCase()} copied to clipboard`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Building2 className="h-4 w-4 text-[#1B6EF3]" />
        <h3 className="text-sm font-semibold text-slate-900">
          Business Identity
        </h3>
      </div>

      <div className="space-y-4 p-5">
        {FIELDS.map(({ key, label }) => {
          const value = identity[key];
          return (
            <div key={key} className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F4F8FF] px-3 py-2.5">
                <code className="text-sm font-semibold tracking-wide text-[#0B1F3A]">
                  {value}
                </code>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-[#1B6EF3] hover:bg-[#E8F1FF] hover:text-[#1B6EF3]"
                    onClick={() => onViewDocument(key)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Document
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-slate-600"
                    onClick={() => handleCopy(key, value)}
                    aria-label={`Copy ${label}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
