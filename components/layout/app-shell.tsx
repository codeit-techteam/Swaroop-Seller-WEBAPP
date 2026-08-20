"use client";

import type { ReactNode } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useDisclosure, useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";

import { FloatingActionButton } from "../erp/floating-action-button";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const isMobile = useIsMobile();
  const mobileNav = useDisclosure();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7F9]">
      {!isMobile ? <Sidebar /> : null}
      {isMobile ? (
        <Sheet open={mobileNav.isOpen} onOpenChange={mobileNav.setIsOpen}>
          <SheetContent side="left" className="w-[260px] p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={mobileNav.open} />
        <main className={cn("relative flex-1 overflow-y-auto pb-20", className)}>
          {children}
        </main>
      </div>
      <FloatingActionButton />
    </div>
  );
}
