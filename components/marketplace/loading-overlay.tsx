"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export function LoadingOverlay({
  open,
  message = "Processing...",
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#1B6EF3]" />
            <p className="text-sm font-medium text-slate-700">{message}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
