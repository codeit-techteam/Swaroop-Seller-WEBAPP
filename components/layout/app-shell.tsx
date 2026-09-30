"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { VerificationBanner } from "@/components/verification/verification-banner";
import { isNavHrefActive, MOBILE_NAV_ITEMS, permissionForPath } from "@/config";
import { useDisclosure, useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";

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
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.hasHydrated && s.isAuthenticated);
  const requiredPermission = permissionForPath(pathname);
  const blocked =
    Array.isArray(user?.permissions) &&
    Boolean(requiredPermission) &&
    !user.permissions.includes(requiredPermission!);
  const mobileItems = MOBILE_NAV_ITEMS.filter((item) => {
    if (!user?.permissions || !item.permission) return true;
    return user.permissions.includes(item.permission);
  });
  const hydrateLocations = useLocationStore((s) => s.hydrate);
  const locationsHydrated = useLocationStore((s) => s.hydrated);
  const locationsLoading = useLocationStore((s) => s.loading);

  useEffect(() => {
    if (!authReady) return;
    if (!locationsHydrated && !locationsLoading) {
      void hydrateLocations();
    }
  }, [authReady, hydrateLocations, locationsHydrated, locationsLoading]);

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
          <VerificationBanner />
          <main
            className={cn(
              "relative flex-1 overflow-y-auto pb-16 lg:pb-0",
              className,
            )}
          >
            {blocked ? (
              <div className="m-6 rounded-xl border border-slate-200 bg-white p-6">
                <h1 className="text-lg font-semibold text-slate-900">
                  Access restricted
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Your Seller Manager account does not include this module. Ask
                  a Super Admin to update your permissions.
                </p>
              </div>
            ) : (
              children
            )}
          </main>
          {isMobile ? (
            <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-slate-200 bg-white lg:hidden">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const active = isNavHrefActive(
                  pathname,
                  item.href,
                  mobileItems.map((nav) => nav.href),
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
