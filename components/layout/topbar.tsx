"use client";

import { format } from "date-fns";
import { Bell, ChevronDown, Clock3, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { NotificationDropdown } from "@/components/performance/notification-dropdown";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { usePerformanceStore } from "@/store/performanceStore";

import { ProfileMenu } from "../navigation/profile-menu";

interface TopbarProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Topbar({ onMenuClick, className }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isInventory = pathname.startsWith(ROUTES.INVENTORY);
  const isPerformance = pathname.startsWith(ROUTES.PERFORMANCE_DASHBOARD);
  const isProfile = pathname.startsWith(ROUTES.PROFILE);
  const dashboardSearch = useDashboardStore((s) => s.search);
  const setDashboardSearch = useDashboardStore((s) => s.setSearch);
  const inventorySearch = useInventoryStore((s) => s.filters.search);
  const setInventorySearch = useInventoryStore((s) => s.setSearch);
  const performanceSearch = usePerformanceStore((s) => s.globalSearch);
  const setPerformanceSearch = usePerformanceStore((s) => s.setGlobalSearch);
  const performanceNotifications = usePerformanceStore((s) => s.notifications);
  const notificationOpen = usePerformanceStore((s) => s.notificationOpen);
  const setNotificationOpen = usePerformanceStore((s) => s.setNotificationOpen);
  const markNotificationRead = usePerformanceStore(
    (s) => s.markNotificationRead,
  );
  const markAllNotificationsRead = usePerformanceStore(
    (s) => s.markAllNotificationsRead,
  );
  const getUnreadCount = usePerformanceStore((s) => s.getUnreadCount);
  const getSearchResults = usePerformanceStore((s) => s.getSearchResults);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [dateOpen, setDateOpen] = useState(false);

  const placeholder = useMemo(() => {
    if (isInventory) return "Quick search inventory...";
    if (isPerformance) return "Global Trade Search...";
    return "Search customers, orders, PRs, products, offers…";
  }, [isInventory, isPerformance]);

  const searchValue = isInventory
    ? inventorySearch
    : isPerformance
      ? performanceSearch
      : dashboardSearch;

  const handleSearchChange = (value: string) => {
    if (isInventory) {
      setInventorySearch(value);
      return;
    }
    if (isPerformance) {
      setPerformanceSearch(value);
      return;
    }
    setDashboardSearch(value);
  };

  const searchResults = isPerformance ? getSearchResults() : [];
  const unreadCount = isPerformance ? getUnreadCount() : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6",
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

      {isInventory ? (
        <p className="hidden shrink-0 text-sm font-semibold text-slate-800 xl:block">
          Petrochemical Procurement
        </p>
      ) : null}

      {isProfile ? (
        <p className="hidden shrink-0 text-base font-bold text-[#0B1F3A] lg:block">
          Admin Profile
        </p>
      ) : null}

      <div className="relative mx-auto w-full max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = searchValue.trim();
            if (value.length < 2) return;
            router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(value)}`);
          }}
        >
          <Input
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 border-slate-200 bg-slate-50 pl-9 text-sm shadow-none focus-visible:ring-[#1B6EF3]"
            aria-label="Global search"
          />
        </form>
        {isPerformance && searchResults.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {searchResults.map((result) => (
              <Link
                key={result.id}
                href={result.href}
                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => setPerformanceSearch("")}
              >
                <span className="font-medium text-slate-800">
                  {result.label}
                </span>
                <span className="text-xs text-slate-400">{result.type}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isPerformance ? (
          <NotificationDropdown
            notifications={performanceNotifications}
            unreadCount={unreadCount}
            open={notificationOpen}
            onOpenChange={setNotificationOpen}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
          />
        ) : (
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href={ROUTES.NOTIFICATIONS}>
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => toast.success("History panel opened (mock)")}
        >
          <Clock3 className="h-5 w-5 text-slate-600" />
          <span className="sr-only">History</span>
        </Button>

        {!isInventory && !isProfile ? (
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="ml-1 hidden h-9 gap-2 border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 md:inline-flex"
              >
                {format(selectedDate, "dd/MM/yyyy")}
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                  setDateOpen(false);
                  toast.success(`Date set to ${format(date, "dd/MM/yyyy")}`);
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}

        <ProfileMenu />
      </div>
    </header>
  );
}
