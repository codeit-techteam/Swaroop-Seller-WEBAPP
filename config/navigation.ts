import {
  ClipboardList,
  FileBarChart,
  FileText,
  GitCompare,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
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
      {
        label: "Procurement Workbench",
        href: ROUTES.PROCUREMENT,
        icon: Package,
        permission: "procurement.view",
        children: [
          {
            label: "Procurement Queue",
            href: ROUTES.PROCUREMENT_QUEUE,
            icon: ListChecks,
            permission: "procurement.view",
          },
          {
            label: "Procurement Orders",
            href: ROUTES.PROCUREMENT_ORDERS,
            icon: ShoppingCart,
            permission: "procurement.view",
          },
          {
            label: "Seller Comparison",
            href: ROUTES.PROCUREMENT_SELLER_COMPARISON,
            icon: GitCompare,
            permission: "procurement.manage",
            hideForSeller: true,
          },
          {
            label: "Price Negotiation",
            href: ROUTES.PROCUREMENT_NEGOTIATION,
            icon: MessageSquare,
            permission: "procurement.view",
          },
          {
            label: "Purchase Requests",
            href: ROUTES.PROCUREMENT_PURCHASE_REQUESTS,
            icon: ClipboardList,
            permission: "procurement.view",
          },
          {
            label: "PR Tracking",
            href: ROUTES.PROCUREMENT_TRACKING,
            icon: Truck,
            permission: "procurement.view",
          },
          {
            label: "Procurement Approval",
            href: ROUTES.PROCUREMENT_APPROVAL,
            icon: ShieldCheck,
            permission: "procurement.manage",
            hideForSeller: true,
          },
          {
            label: "Documents",
            href: ROUTES.PROCUREMENT_DOCUMENTS,
            icon: FileText,
            permission: "procurement.view",
            sellerOnly: true,
          },
          {
            label: "Reports",
            href: ROUTES.PROCUREMENT_REPORTS,
            icon: FileBarChart,
            permission: "procurement.manage",
            hideForSeller: true,
          },
        ],
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
        label: "Price Revisions",
        href: ROUTES.PRICE_REVISIONS,
        icon: FileText,
        permission: "offers.review",
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
    id: "administration",
    title: "ADMINISTRATION",
    items: [
      {
        label: "Customer",
        href: ROUTES.USERS,
        icon: Users,
        permission: "users.view",
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
