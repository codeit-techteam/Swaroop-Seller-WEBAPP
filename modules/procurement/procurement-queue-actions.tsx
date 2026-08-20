"use client";

import {
  CheckCircle2,
  ClipboardList,
  Eye,
  GitCompare,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProcurementItem } from "@/types/procurement";

interface ProcurementQueueActionsProps {
  item: ProcurementItem;
  isAdmin: boolean;
  onReview: () => void;
  onAssignSeller: () => void;
  onCompare: () => void;
  onNegotiate: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSubmitQuote: () => void;
}

function ActionMenuItem({
  children,
  onClick,
  href,
  destructive,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const className = cn(
    "gap-2 text-sm",
    destructive && "text-red-600 focus:text-red-600",
  );

  if (href) {
    return (
      <DropdownMenuItem asChild className={className}>
        <Link href={href}>
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {children}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem onClick={onClick} className={className}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </DropdownMenuItem>
  );
}

function getPrimaryAdminAction(item: ProcurementItem) {
  switch (item.status) {
    case "NEW":
      return { label: "Review", action: "review" as const };
    case "UNDER_REVIEW":
      return { label: "Assign seller", action: "assign" as const };
    case "QUOTATION_RECEIVED":
      return { label: "Compare", action: "compare" as const };
    case "NEGOTIATION":
      return { label: "Negotiate", action: "negotiate" as const };
    case "APPROVAL_PENDING":
    case "PENDING_APPROVAL":
      return { label: "Approve", action: "approve" as const };
    case "SELLER_SOURCING":
      return { label: "Assign seller", action: "assign" as const };
    default:
      return { label: "View", action: "view" as const };
  }
}

export function ProcurementQueueActions({
  item,
  isAdmin,
  onReview,
  onAssignSeller,
  onCompare,
  onNegotiate,
  onApprove,
  onReject,
  onSubmitQuote,
}: ProcurementQueueActionsProps) {
  const detailHref = `${ROUTES.PROCUREMENT_PURCHASE_REQUESTS}/${item.requestId}`;
  const canReject = !["REJECTED", "CANCELLED", "COMPLETED", "CONVERTED_TO_PO"].includes(
    item.status,
  );

  const runPrimary = (action: ReturnType<typeof getPrimaryAdminAction>["action"]) => {
    switch (action) {
      case "review":
        onReview();
        break;
      case "assign":
        onAssignSeller();
        break;
      case "compare":
        onCompare();
        break;
      case "negotiate":
        onNegotiate();
        break;
      case "approve":
        onApprove();
        break;
      case "view":
        break;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          size="sm"
          className="h-8 bg-[#0B1F3A] px-3 text-xs hover:bg-[#122846]"
          onClick={onSubmitQuote}
        >
          Submit quote
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <ActionMenuItem href={detailHref} icon={Eye}>
              View details
            </ActionMenuItem>
            <ActionMenuItem
              href={`${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`}
              icon={MessageSquare}
            >
              Negotiate
            </ActionMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const primary = getPrimaryAdminAction(item);

  return (
    <div className="flex items-center justify-end gap-1">
      {primary.action === "view" ? (
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-slate-200 px-3 text-xs"
          asChild
        >
          <Link href={detailHref}>View</Link>
        </Button>
      ) : (
        <Button
          size="sm"
          className="h-8 bg-[#0B1F3A] px-3 text-xs hover:bg-[#122846]"
          onClick={() => runPrimary(primary.action)}
        >
          {primary.label}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <ActionMenuItem href={detailHref} icon={Eye}>
            View details
          </ActionMenuItem>
          {primary.action !== "review" ? (
            <ActionMenuItem onClick={onReview} icon={ClipboardList}>
              Mark under review
            </ActionMenuItem>
          ) : null}
          {primary.action !== "assign" ? (
            <ActionMenuItem onClick={onAssignSeller} icon={UserPlus}>
              Assign seller
            </ActionMenuItem>
          ) : null}
          {primary.action !== "compare" ? (
            <ActionMenuItem onClick={onCompare} icon={GitCompare}>
              Compare quotes
            </ActionMenuItem>
          ) : null}
          {primary.action !== "negotiate" ? (
            <ActionMenuItem onClick={onNegotiate} icon={MessageSquare}>
              Negotiate
            </ActionMenuItem>
          ) : null}
          {primary.action !== "approve" &&
          ["APPROVAL_PENDING", "PENDING_APPROVAL", "NEGOTIATION", "QUOTATION_RECEIVED"].includes(
            item.status,
          ) ? (
            <ActionMenuItem onClick={onApprove} icon={CheckCircle2}>
              Approve
            </ActionMenuItem>
          ) : null}
          {canReject ? (
            <>
              <DropdownMenuSeparator />
              <ActionMenuItem onClick={onReject} destructive icon={XCircle}>
                Reject
              </ActionMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
