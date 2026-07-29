"use client";

import { format, parseISO } from "date-fns";
import { Copy, Eye, History, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/offer-review/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { OfferReview } from "@/types/offer-review";

function formatDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

interface OfferReviewRowProps {
  offer: OfferReview;
  active: boolean;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
}

export function OfferReviewRow({
  offer,
  active,
  onView,
  onEdit,
  onDuplicate,
  onWithdraw,
  onHistory,
}: OfferReviewRowProps) {
  const canWithdraw =
    offer.status === "pending_review" || offer.status === "needs_changes";

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors hover:bg-slate-50/80",
        active && "bg-[#F5F9FF] ring-1 ring-inset ring-[#1B6EF3]/30",
      )}
      onClick={onView}
    >
      <TableCell>
        <button
          type="button"
          className="font-semibold text-[#1B6EF3] hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            onView();
          }}
        >
          {offer.offerId}
        </button>
      </TableCell>
      <TableCell className="font-medium text-slate-800">
        {offer.productGrade}
      </TableCell>
      <TableCell className="text-slate-600">{offer.warehouse}</TableCell>
      <TableCell className="tabular-nums text-slate-700">
        {offer.quantityMt.toLocaleString("en-IN")}
      </TableCell>
      <TableCell className="tabular-nums font-medium text-slate-800">
        {formatCurrency(offer.basePrice)}
      </TableCell>
      <TableCell className="tabular-nums text-slate-600">
        {formatDate(offer.submittedAt)}
      </TableCell>
      <TableCell>
        <StatusBadge status={offer.status} />
      </TableCell>
      <TableCell onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onView}
            title="View review"
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            title="Edit offer"
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                View Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit Offer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHistory}>
                <History className="mr-2 h-3.5 w-3.5" />
                History
              </DropdownMenuItem>
              {canWithdraw ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onWithdraw}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Withdraw
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
