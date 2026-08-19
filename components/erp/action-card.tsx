"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface ActionCardProps {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "light" | "dark";
  className?: string;
}

export function ActionCard({
  label,
  icon: Icon,
  href,
  onClick,
  variant = "dark",
  className,
}: ActionCardProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center shadow-sm transition-all hover:shadow-md",
        variant === "dark"
          ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
          : "border-slate-200 bg-white text-slate-700 hover:border-[#1B6EF3]/50 hover:bg-[#F5F9FF]",
        className,
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
      <span className="text-xs font-semibold">{label}</span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
