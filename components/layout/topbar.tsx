"use client";

import { Bell, HelpCircle, Menu } from "lucide-react";
import Link from "next/link";

import { LocationSelector } from "@/components/header/location-selector";
import { ProfileMenu } from "@/components/navigation/profile-menu";
import { SellerGlobalSearch } from "@/components/seller/global-search";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSellerNotificationStore } from "@/store/sellerNotificationStore";

interface TopbarProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Topbar({ onMenuClick, className }: TopbarProps) {
  const unreadCount = useSellerNotificationStore((s) => s.getUnreadCount());

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <p className="hidden shrink-0 text-sm font-bold text-[#0B1F3A] md:block">
        PetroTrade
      </p>

      <SellerGlobalSearch />

      <div className="flex shrink-0 items-center gap-1.5">
        <LocationSelector />
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href={ROUTES.NOTIFICATIONS}>
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
            <span className="sr-only">
              Notifications{unreadCount > 0 ? `, ${unreadCount} unread` : ""}
            </span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.SUPPORT} aria-label="Help and support">
            <HelpCircle className="h-5 w-5 text-slate-600" />
          </Link>
        </Button>
        <ProfileMenu />
      </div>
    </header>
  );
}
