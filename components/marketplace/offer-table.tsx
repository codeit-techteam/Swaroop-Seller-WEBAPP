"use client";

import {
  Copy,
  Eye,
  FlaskConical,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { OfferStatusBadge } from "@/components/marketplace/offer-status-badge";
import { VisibilitySwitch } from "@/components/marketplace/visibility-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Offer } from "@/types/offers";

interface OfferTableProps {
  offers: Offer[];
  emptyMessage?: string;
  showCreateCta?: boolean;
  onToggleVisibility: (offerId: string) => void;
  onPause: (offerId: string) => void;
  onResume: (offerId: string) => void;
  onDuplicate: (offerId: string) => void;
  onDelete: (offerId: string) => void;
  onView: (offer: Offer) => void;
}

export function OfferTable({
  offers,
  emptyMessage = "No offers available.",
  showCreateCta = false,
  onToggleVisibility,
  onPause,
  onResume,
  onDuplicate,
  onDelete,
  onView,
}: OfferTableProps) {
  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16">
        <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
        <p className="mt-1 text-xs text-slate-400">
          Try adjusting your search or filters
        </p>
        {showCreateCta ? (
          <Button
            asChild
            className="mt-4 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
            size="sm"
          >
            <Link href={ROUTES.OFFERS_CREATE}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create First Offer
            </Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Offer ID
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Product
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Product Grade
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Pricing (₹/MT)
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              MOQ
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Visibility
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id} className="hover:bg-slate-50/50">
              <TableCell>
                <p className="font-semibold text-slate-800">{offer.offerId}</p>
                <p className="text-xs text-slate-400">
                  {offer.quantityMt} MT allocated
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <FlaskConical className="h-4 w-4 text-[#1B6EF3]" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {offer.productName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {offer.productSubtext}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-slate-600">
                {offer.productGrade}
              </TableCell>
              <TableCell className="font-semibold tabular-nums text-slate-800">
                {formatCurrency(offer.basePrice)}
              </TableCell>
              <TableCell className="tabular-nums text-slate-600">
                {offer.moq} MT
              </TableCell>
              <TableCell>
                <VisibilitySwitch
                  checked={offer.visibility}
                  onCheckedChange={() => {
                    onToggleVisibility(offer.id);
                    toast.success(
                      offer.visibility ? "Offer Hidden" : "Offer Published",
                    );
                  }}
                />
              </TableCell>
              <TableCell>
                <OfferStatusBadge status={offer.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onView(offer)}
                    title="View"
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                    title="Edit"
                  >
                    <Link href={`${ROUTES.OFFERS_EDIT}/${offer.id}`}>
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDuplicate(offer.id)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4 text-slate-500" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(offer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`${ROUTES.OFFERS_EDIT}/${offer.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(offer.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {offer.status === "paused" ? (
                        <DropdownMenuItem onClick={() => onResume(offer.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onPause(offer.id)}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(offer.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
