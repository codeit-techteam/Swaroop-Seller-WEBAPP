"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { isNavHrefActive, MOBILE_NAV_ITEMS } from "@/config";
import { useDisclosure, useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const isMobile = useIsMobile();
  const mobileNav = useDisclosure();
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#F4F7F9]">
        {!isMobile ? <Sidebar /> : null}
        {isMobile ? (
          <Sheet open={mobileNav.isOpen} onOpenChange={mobileNav.setIsOpen}>
            <SheetContent side="left" className="w-[260px] p-0">
              <Sidebar collapsed={false} />
            </SheetContent>
          </Sheet>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar onMenuClick={mobileNav.open} />
          <main
            className={cn(
              "relative flex-1 overflow-y-auto pb-16 lg:pb-0",
              className,
            )}
          >
            {children}
          </main>
          {isMobile ? (
            <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-slate-200 bg-white lg:hidden">
              {MOBILE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isNavHrefActive(
                  pathname,
                  item.href,
                  MOBILE_NAV_ITEMS.map((nav) => nav.href),
                );
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-0.5 text-[10px] font-medium",
                      active ? "text-[#1B6EF3]" : "text-slate-500",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </div>
    </AuthGuard>
  );
}
