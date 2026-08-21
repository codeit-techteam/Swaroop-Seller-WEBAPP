"use client";

import { Bell, CircleHelp, Fuel } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

interface TopNavigationProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  className?: string;
}

export function TopNavigation({
  title,
  subtitle,
  showBrand = false,
  className,
}: TopNavigationProps) {
  const companyName = useOnboardingStore((s) => s.company.companyName);

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center justify-between border-b bg-card px-6",
        className,
      )}
    >
      <div>
        {title ? (
          <>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2",
              !showBrand && "lg:hidden",
            )}
          >
            <Fuel className="h-5 w-5 text-primary" />
            <span className="font-semibold">ADMIN PANEL</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <CircleHelp className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="ml-2 flex items-center gap-3 border-l pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{companyName || "Ops Admin"}</p>
            <p className="text-xs text-muted-foreground">VERIFIED TRADER</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {companyName ? companyName.charAt(0).toUpperCase() : "OA"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
