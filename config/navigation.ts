import {
  Bell,
  ClipboardList,
  FileText,
  Headphones,
  LayoutDashboard,
  Package,
  Percent,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  User,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { ComponentType } from "react";

import { ROUTES } from "@/lib/constants";

import { canAccess, type Permission } from "./permissions";
import { isSellerRole, type UserRole } from "./roles";

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
    id: "overview",
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
        label: "Inventory",
        href: ROUTES.INVENTORY,
        icon: Warehouse,
        permission: "inventory.view",
        hideForSeller: true,
      },
      {
        label: "Catalog",
        href: ROUTES.MARKETPLACE_CATALOG,
        icon: Package,
        permission: "catalog.view",
        hideForSeller: true,
        children: [
          {
            label: "Products",
            href: ROUTES.MARKETPLACE_CATALOG,
            icon: Package,
            permission: "catalog.manage",
            hideForSeller: true,
          },
          {
            label: "Categories",
            href: ROUTES.MARKETPLACE_CATEGORIES,
            icon: Package,
            permission: "catalog.manage",
            hideForSeller: true,
          },
          {
            label: "Pricing",
            href: ROUTES.MARKETPLACE_PRICING,
            icon: Percent,
            permission: "catalog.manage",
            hideForSeller: true,
          },
          {
            label: "Promotions",
            href: ROUTES.MARKETPLACE_OFFERS,
            icon: Tag,
            permission: "catalog.manage",
            hideForSeller: true,
          },
        ],
      },
      {
        label: "Active Offers",
        href: ROUTES.OFFERS,
        icon: Tag,
        permission: "offers.view",
        hideForSeller: true,
      },
      {
        label: "Purchase Requests",
        href: ROUTES.PURCHASE_REQUESTS,
        icon: ClipboardList,
        permission: "procurement.view",
        hideForSeller: true,
      },
    ],
  },
  {
    id: "commerce",
    title: "COMMERCE",
    items: [
      {
        label: "Orders",
        href: ROUTES.ORDERS,
        icon: ShoppingCart,
        permission: "orders.view",
        hideForSeller: true,
      },
      {
        label: "Customer Orders",
        href: ROUTES.CUSTOMER_ORDERS,
        icon: ShoppingCart,
        permission: "customers.view",
      },
      {
        label: "Offer Review",
        href: ROUTES.OFFER_REVIEW_STATUS,
        icon: ClipboardList,
        permission: "offers.review",
      },
    ],
  },
  {
    id: "operations",
    title: "OPERATIONS",
    items: [
      {
        label: "Dispatch Operations",
        href: ROUTES.DISPATCH,
        icon: Truck,
        permission: "logistics.view",
        hideForSeller: true,
      },
      {
        label: "Shipment Tracking",
        href: ROUTES.SHIPMENT_TRACKING,
        icon: Truck,
        permission: "logistics.view",
        hideForSeller: true,
      },
    ],
  },
  {
    id: "finance",
    title: "FINANCE",
    items: [
      {
        label: "Payments",
        href: ROUTES.PAYMENTS,
        icon: Wallet,
        permission: "finance.view",
      },
      {
        label: "Receivables",
        href: ROUTES.RECEIVABLES,
        icon: Wallet,
        permission: "finance.view",
      },
      {
        label: "Credit Insurance",
        href: ROUTES.CREDIT_INSURANCE,
        icon: ShieldCheck,
        permission: "finance.view",
      },
    ],
  },
  {
    id: "customer-experience",
    title: "CUSTOMER EXPERIENCE",
    items: [
      {
        label: "Customers",
        href: ROUTES.CUSTOMERS,
        icon: Users,
        permission: "customers.view",
        children: [
          {
            label: "Directory",
            href: ROUTES.CUSTOMERS,
            icon: Users,
            permission: "customers.view",
            hideForSeller: true,
          },
          {
            label: "Requests",
            href: ROUTES.CUSTOMER_REQUESTS,
            icon: ClipboardList,
            permission: "customers.view",
          },
          {
            label: "Support",
            href: ROUTES.CUSTOMER_SUPPORT,
            icon: Headphones,
            permission: "support.view",
          },
          {
            label: "Notifications",
            href: ROUTES.CUSTOMER_NOTIFICATIONS,
            icon: Bell,
            permission: "notifications.manage",
            hideForSeller: true,
          },
        ],
      },
    ],
  },
  {
    id: "compliance",
    title: "COMPLIANCE",
    items: [
      {
        label: "KYC",
        href: ROUTES.KYC,
        icon: FileText,
        permission: "compliance.view",
        hideForSeller: true,
      },
      {
        label: "Documents",
        href: ROUTES.DOCUMENT_CENTER,
        icon: FileText,
        permission: "compliance.view",
        hideForSeller: true,
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
    ],
  },
];

function visibleItem(item: NavItem, role: UserRole): boolean {
  if (!canAccess(role, item.permission)) return false;
  if (isSellerRole(role) && item.hideForSeller) return false;
  if (item.sellerOnly && !isSellerRole(role) && role !== "ADMIN") return false;
  return true;
}

export function getVisibleNavSections(role: UserRole): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => visibleItem(item, role))
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) => visibleItem(child, role)),
      })),
  })).filter((section) => section.items.length > 0);
}
