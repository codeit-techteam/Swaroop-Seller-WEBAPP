"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronRight,
  FileWarning,
  Truck,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { PriorityTask } from "@/types/dashboard";

const iconMap = {
  dispatch: Truck,
  certificate: FileWarning,
  settlement: Wallet,
  compliance: AlertTriangle,
};

interface PriorityCardProps {
  task: PriorityTask;
  onClick?: () => void;
  className?: string;
}

export function PriorityCard({ task, onClick, className }: PriorityCardProps) {
  const Icon = iconMap[task.type] ?? AlertTriangle;

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-transparent bg-slate-50 p-3 text-left transition-colors hover:border-slate-200 hover:bg-white",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          task.type === "certificate" || task.type === "compliance"
            ? "bg-red-50 text-red-600"
            : "bg-slate-200/70 text-slate-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800">
          {task.title}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {task.description}
        </span>
      </span>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
    </motion.button>
  );
}
