"use client";

import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  collectNavHrefs,
  CURRENT_USER,
  getVisibleNavSections,
  isNavHrefActive,
  ROLE_LABELS,
} from "@/config";
import { ROUTES } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.role ?? CURRENT_USER.role;
  const navSections = useMemo(() => getVisibleNavSections(role), [role]);
  const allHrefs = useMemo(() => collectNavHrefs(navSections), [navSections]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expand active nav groups during render (no effect sync).
  const autoOpenGroups = useMemo(() => {
    const next: Record<string, boolean> = {};
    for (const section of navSections) {
      for (const item of section.items) {
        if (!item.children?.length) continue;
        const groupActive = item.children.some((child) =>
          isNavHrefActive(pathname, child.href, allHrefs),
        );
        if (groupActive) next[item.href] = true;
      }
    }
    return next;
  }, [allHrefs, navSections, pathname]);

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    logout();
    router.push(ROUTES.SELLER_LOGIN);
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-[260px]",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100 px-4">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0B1F3A] text-white">
            <Package className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-[#0B1F3A]">
                PetroTrade
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                ADMIN PANEL
              </p>
            </div>
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {navSections.map((section, sectionIndex) => (
          <div
            key={section.id ?? `section-${sectionIndex}`}
            className="space-y-1"
          >
            {section.title && !collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {section.title}
              </p>
            ) : null}
            {section.items.map((item) => {
              const children = item.children ?? [];
              const groupActive = children.some((child) =>
                isNavHrefActive(pathname, child.href, allHrefs),
              );
              const isActive =
                children.length > 0
                  ? false
                  : isNavHrefActive(pathname, item.href, allHrefs);
              const Icon = item.icon;
              const expanded =
                openGroups[item.href] ?? autoOpenGroups[item.href] ?? false;

              return (
                <div key={`${item.href}-${item.label}`}>
                  {children.length ? (
                    <div
                      className={cn(
                        "rounded-lg transition-colors",
                        expanded && !collapsed && "bg-slate-50",
                      )}
                    >
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(
                            "group relative flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                            groupActive
                              ? "text-slate-900"
                              : "text-slate-600 hover:bg-white/80 hover:text-slate-900",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              groupActive ? "text-[#1B6EF3]" : "text-slate-400",
                            )}
                          />
                          {!collapsed ? (
                            <span className="truncate">{item.label}</span>
                          ) : null}
                        </Link>
                        {!collapsed ? (
                          <button
                            type="button"
                            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
                            aria-expanded={expanded}
                            onClick={() =>
                              setOpenGroups((current) => ({
                                ...current,
                                [item.href]: !expanded,
                              }))
                            }
                            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform",
                                expanded ? "rotate-0" : "-rotate-90",
                              )}
                            />
                          </button>
                        ) : null}
                      </div>
                      {expanded && !collapsed ? (
                        <div className="ml-[22px] space-y-0.5 border-l border-slate-200 pb-1.5 pl-2 pr-1.5">
                          {children.map((child) => {
                            const childActive = isNavHrefActive(
                              pathname,
                              child.href,
                              allHrefs,
                            );
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={`${child.href}-${child.label}`}
                                href={child.href}
                                aria-current={childActive ? "page" : undefined}
                                className={cn(
                                  "relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
                                  childActive
                                    ? "bg-[#E8F1FF] text-[#1B6EF3]"
                                    : "text-slate-500 hover:bg-white hover:text-slate-800",
                                )}
                              >
                                {childActive ? (
                                  <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-[#1B6EF3]" />
                                ) : null}
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-[#E8F1FF] text-[#1B6EF3]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      {isActive ? (
                        <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-[#1B6EF3]" />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-[#1B6EF3]"
                            : "text-slate-400 group-hover:text-slate-600",
                        )}
                      />
                      {!collapsed ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1B6EF3] px-1.5 text-[10px] font-semibold text-white">
                              {item.badge}
                            </span>
                          ) : null}
                          {item.alert ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 px-3 py-2">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-600" />
          {!collapsed ? <span className="flex-1 truncate">Logout</span> : null}
        </button>
      </div>

      {!collapsed ? (
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt={user?.name ?? CURRENT_USER.name} />
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(user?.name ?? CURRENT_USER.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {user?.name ?? CURRENT_USER.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#1B6EF3]">
                <BadgeCheck className="h-3 w-3" />
                {ROLE_LABELS[role]}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to log out of PetroTrade ADMIN PANEL? Any
              unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Logout
            </AlertDialogAction>
            <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
