"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  FileBarChart,
  FileUp,
  PackagePlus,
  Plus,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";
import type { CommandAction } from "@/types/dashboard";

const actionIcons: Record<
  NonNullable<CommandAction["action"]>,
  typeof Tag
> = {
  "create-offer": Tag,
  "update-stock": PackagePlus,
  "create-pr": ClipboardList,
  "upload-kyc": FileUp,
  reports: FileBarChart,
  "view-orders": ShoppingCart,
};

/** Routes where the FAB overlaps primary table actions or footers. */
const HIDDEN_FAB_PREFIXES = [
  "/seller",
  "/login",
  "/register",
  "/products/add",
  "/offers/create",
  "/receivables",
  "/payments",
  "/credit-insurance",
];

const HIDDEN_FAB_PATTERNS = [
  /^\/offers\/edit\/.+/,
  /^\/offers\/preview\/.+/,
];

function shouldHideFab(pathname: string): boolean {
  if (HIDDEN_FAB_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return HIDDEN_FAB_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function FloatingActionButton() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const fabOpen = useDashboardStore((s) => s.fabOpen);
  const setFabOpen = useDashboardStore((s) => s.setFabOpen);
  const commandActions = useDashboardStore((s) => s.commandActions);

  useEffect(() => {
    setFabOpen(false);
  }, [pathname, setFabOpen]);

  if (shouldHideFab(pathname)) {
    return null;
  }

  const quickActions = commandActions.filter(
    (action) => action.action !== "reports",
  );

  return (
    <>
      <AnimatePresence>
        {fabOpen ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close quick actions"
            className="fixed inset-0 z-40 bg-slate-900/15 backdrop-blur-[1px]"
            onClick={() => setFabOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      {/* Bottom-left keeps table action columns on the right unobstructed */}
      <div
        className={cn(
          "pointer-events-none fixed z-50 flex flex-col items-start gap-2.5",
          isMobile ? "bottom-5 left-4" : "bottom-6 left-[calc(260px+1.25rem)]",
        )}
      >
        <AnimatePresence>
          {fabOpen
            ? quickActions.map((action, index) => {
                const Icon =
                  (action.action && actionIcons[action.action]) ?? Tag;

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 12, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.94 }}
                    transition={{ delay: index * 0.04, duration: 0.18 }}
                    className="pointer-events-auto"
                  >
                    <Button
                      asChild
                      variant="secondary"
                      className="h-10 gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50"
                      onClick={() => setFabOpen(false)}
                    >
                      <Link href={action.href ?? "#"}>
                        <Icon className="h-4 w-4 text-[#1B6EF3]" />
                        {action.label}
                      </Link>
                    </Button>
                  </motion.div>
                );
              })
            : null}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setFabOpen(!fabOpen)}
          title={fabOpen ? "Close quick actions" : "Quick actions"}
          className={cn(
            "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-white shadow-lg ring-1 ring-slate-900/5 transition-colors",
            fabOpen
              ? "bg-slate-800 hover:bg-slate-900"
              : "bg-[#1B6EF3] hover:bg-[#1558C8]",
          )}
          aria-label={fabOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={fabOpen}
        >
          {fabOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </motion.button>
      </div>
    </>
  );
}
