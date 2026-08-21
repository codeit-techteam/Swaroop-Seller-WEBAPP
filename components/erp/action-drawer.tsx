"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  widthClassName?: string;
}

export function ActionDrawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  widthClassName = "w-full max-w-md",
}: ActionDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l border-slate-200 bg-white shadow-2xl",
              widthClassName,
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
              <div className="min-w-0 pr-2">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50/40 px-6 py-5">{children}</div>
            {footer ? (
              <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
