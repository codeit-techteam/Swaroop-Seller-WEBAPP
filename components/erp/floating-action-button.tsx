"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileUp, PackagePlus, Plus, Tag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";

const actions = [
  {
    id: "create-offer",
    label: "Create Offer",
    href: ROUTES.OFFERS,
    icon: Tag,
  },
  {
    id: "inventory",
    label: "Inventory",
    href: ROUTES.INVENTORY,
    icon: PackagePlus,
  },
  {
    id: "upload-document",
    label: "Upload Document",
    href: ROUTES.DOCUMENTS,
    icon: FileUp,
  },
];

export function FloatingActionButton() {
  const pathname = usePathname();
  const fabOpen = useDashboardStore((s) => s.fabOpen);
  const setFabOpen = useDashboardStore((s) => s.setFabOpen);

  if (
    pathname.startsWith("/seller") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {fabOpen
          ? actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ delay: index * 0.04 }}
                  className="pointer-events-auto"
                >
                  <Button
                    asChild
                    variant="secondary"
                    className="h-10 gap-2 rounded-full border border-slate-200 bg-white px-4 text-slate-700 shadow-lg hover:bg-slate-50"
                    onClick={() => {
                      setFabOpen(false);
                      toast.success(`${action.label} opened`);
                    }}
                  >
                    <Link href={action.href}>
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setFabOpen(!fabOpen)}
        className={cn(
          "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-colors",
          fabOpen ? "bg-slate-800" : "bg-[#1B6EF3] hover:bg-[#1558C8]",
        )}
        aria-label="Quick actions"
      >
        {fabOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </motion.button>
    </div>
  );
}
