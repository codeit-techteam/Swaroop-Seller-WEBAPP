import {
  CalendarClock,
  ClipboardList,
  FileText,
  Headset,
  IndianRupee,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  User,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { ComponentType } from "react";

import { ROUTES } from "@/lib/constants";

import { canAccess, type Permission } from "./permissions";
import type { UserRole } from "./roles";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  permission: Permission;
  badge?: number;
  alert?: boolean;
  children?: NavItem[];
  hideForSeller?: boolean;
  sellerOnly?: boolean;
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    id: "marketplace",
    title: "MARKETPLACE",
    items: [
      {
        label: "My Products",
        href: ROUTES.PRODUCTS,
        icon: Package,
        permission: "catalog.view",
      },
      {
        label: "Inventory",
        href: ROUTES.INVENTORY,
        icon: Warehouse,
        permission: "inventory.view",
      },
      {
        label: "My Offers",
        href: ROUTES.OFFERS,
        icon: Tag,
        permission: "offers.view",
      },
      {
        label: "Purchase Requests",
        href: ROUTES.PURCHASE_REQUESTS,
        icon: ClipboardList,
        permission: "procurement.view",
      },
    ],
  },
  {
    id: "orders",
    title: "ORDERS",
    items: [
      {
        label: "Orders",
        href: ROUTES.ORDERS,
        icon: ShoppingCart,
        permission: "orders.view",
      },
      {
        label: "Dispatch",
        href: ROUTES.DISPATCH,
        icon: Truck,
        permission: "logistics.view",
      },
      {
        label: "Vehicle Slots",
        href: ROUTES.VEHICLE_SLOTS,
        icon: CalendarClock,
        permission: "logistics.view",
      },
      {
        label: "Shipment Tracking",
        href: ROUTES.SHIPMENTS,
        icon: MapPin,
        permission: "logistics.view",
      },
    ],
  },
  {
    id: "finance",
    title: "FINANCE",
    items: [
      {
        label: "Settlements",
        href: ROUTES.SETTLEMENTS,
        icon: Wallet,
        permission: "finance.view",
      },
      {
        label: "Payments",
        href: ROUTES.PAYMENTS,
        icon: Wallet,
        permission: "finance.view",
      },
      {
        label: "Price Revision",
        href: ROUTES.PRICE_REVISIONS,
        icon: IndianRupee,
        permission: "finance.view",
      },
    ],
  },
  {
    id: "procurement",
    title: "PROCUREMENT",
    items: [
      {
        label: "Procurement Workbench",
        href: ROUTES.PROCUREMENT_WORKBENCH,
        icon: KanbanSquare,
        permission: "procurement.view",
      },
    ],
  },
  {
    id: "compliance",
    title: "COMPLIANCE",
    items: [
      {
        label: "Documents",
        href: ROUTES.DOCUMENTS,
        icon: FileText,
        permission: "compliance.view",
      },
      {
        label: "Verification",
        href: ROUTES.VERIFICATION,
        icon: ShieldCheck,
        permission: "profile.view",
      },
    ],
  },
  {
    id: "account",
    title: "ACCOUNT",
    items: [
      {
        label: "Profile",
        href: ROUTES.PROFILE,
        icon: User,
        permission: "profile.view",
      },
      {
        label: "Support",
        href: ROUTES.SUPPORT,
        icon: Headset,
        permission: "support.view",
      },
    ],
  },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    label: "Offers",
    href: ROUTES.OFFERS,
    icon: Tag,
    permission: "offers.view",
  },
  {
    label: "Requests",
    href: ROUTES.PURCHASE_REQUESTS,
    icon: ClipboardList,
    permission: "procurement.view",
  },
  {
    label: "Orders",
    href: ROUTES.ORDERS,
    icon: ShoppingCart,
    permission: "orders.view",
  },
  {
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: User,
    permission: "profile.view",
  },
];

function visibleItem(
  item: NavItem,
  role: UserRole,
  permissions?: readonly string[] | null,
): boolean {
  if (!item.permission) return true;
  if (permissions) return permissions.includes(item.permission);
  return canAccess(role, item.permission);
}

export function getVisibleNavSections(
  role: UserRole,
  permissions?: readonly string[] | null,
): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => visibleItem(item, role, permissions))
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) =>
          visibleItem(child, role, permissions),
        ),
      })),
  })).filter((section) => section.items.length > 0);
}

export function collectNavHrefs(sections: NavSection[]): string[] {
  return Array.from(
    new Set(
      sections.flatMap((section) =>
        section.items.flatMap((item) => [
          item.href,
          ...(item.children?.map((child) => child.href) ?? []),
        ]),
      ),
    ),
  );
}

function pathMatchesHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavHrefActive(
  pathname: string,
  href: string,
  allHrefs: string[],
): boolean {
  if (!pathMatchesHref(pathname, href)) return false;
  return !allHrefs.some(
    (candidate) =>
      candidate.length > href.length && pathMatchesHref(pathname, candidate),
  );
}

export function permissionForPath(pathname: string): Permission | undefined {
  const items = NAV_SECTIONS.flatMap((section) => section.items);
  const match = items
    .filter((item) => pathMatchesHref(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.permission;
}

export { LogOut };
