"use client";

import { motion } from "framer-motion";
import { Building2, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BusinessIdentity } from "@/types/profile";

export type IdentityFieldKey = "pan" | "cin";

interface BusinessIdentityCardProps {
  identity: BusinessIdentity;
  onViewDocument: (field: IdentityFieldKey) => void;
  onCopy: (field: IdentityFieldKey, value: string) => void;
  className?: string;
}

const FIELDS: Array<{
  key: IdentityFieldKey;
  label: string;
  hint: string;
}> = [
  { key: "pan", label: "PAN", hint: "Permanent Account Number" },
  { key: "cin", label: "CIN", hint: "Corporate Identity Number" },
];

export function BusinessIdentityCard({
  identity,
  onViewDocument,
  onCopy,
  className,
}: BusinessIdentityCardProps) {
  const handleCopy = (key: IdentityFieldKey, value: string) => {
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
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#1B6EF3]" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Business Identity
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Company registration identifiers
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {FIELDS.map(({ key, label, hint }) => {
          const value = identity[key];
          return (
            <div
              key={key}
              className="flex flex-col rounded-xl border border-slate-100 bg-[#F8FAFC] p-3.5 transition-colors hover:border-[#1B6EF3]/25 hover:bg-[#F4F8FF]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="text-[10px] text-slate-400">{hint}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-slate-400 hover:bg-white hover:text-slate-600"
                  onClick={() => handleCopy(key, value)}
                  aria-label={`Copy ${label}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <code className="mb-3 break-all text-sm font-semibold tracking-wide text-[#0B1F3A]">
                {value}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="mt-auto h-7 w-fit gap-1 px-2 text-xs text-[#1B6EF3] hover:bg-white hover:text-[#1B6EF3]"
                onClick={() => onViewDocument(key)}
              >
                <ExternalLink className="h-3 w-3" />
                View Document
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
