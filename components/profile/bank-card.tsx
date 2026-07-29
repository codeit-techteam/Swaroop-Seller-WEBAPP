"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Landmark } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BankInformation } from "@/types/profile";

interface BankCardProps {
  bank: BankInformation;
  className?: string;
}

export function BankCard({ bank, className }: BankCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-[#1B6EF3]" />
          <h3 className="text-sm font-semibold text-slate-900">
            Bank Information
          </h3>
        </div>
        {bank.verificationStatus === "verified" ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified Account
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Beneficiary Name
          </p>
          <p className="text-sm font-medium text-slate-800">
            {bank.beneficiaryName}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account Number
          </p>
          <p className="font-mono text-sm font-semibold tracking-wider text-slate-800">
            {bank.maskedAccountNumber}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            IFSC Code
          </p>
          <p className="font-mono text-sm font-semibold text-slate-800">
            {bank.ifscCode}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Branch
          </p>
          <p className="text-sm font-medium text-slate-800">{bank.branch}</p>
        </div>
      </div>
    </motion.div>
  );
}
