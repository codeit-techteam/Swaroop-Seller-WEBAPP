"use client";

import {
  FlaskConical,
  MoreHorizontal,
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
  embedded?: boolean;
  onToggleVisibility: (offerId: string) => void;
  onResume: (offerId: string) => void;
  onDelete: (offerId: string) => void;
}

export function OfferTable({
  offers,
  emptyMessage = "No offers available.",
  showCreateCta = false,
  embedded = false,
  onToggleVisibility,
  onResume,
  onDelete,
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
    <div
      className={
        embedded
          ? "overflow-x-auto"
          : "overflow-hidden rounded-xl border border-slate-200 bg-white"
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Offer ID
            </TableHead>
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Product
            </TableHead>
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Product Grade
            </TableHead>
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Pricing (₹/MT)
            </TableHead>
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              MOQ
            </TableHead>
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Visibility
            </TableHead>
            <TableHead className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Status
            </TableHead>
            <TableHead className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id} className="hover:bg-slate-50/50">
              <TableCell className="px-4 py-4">
                <p className="font-semibold text-slate-800">{offer.offerId}</p>
                <p className="text-xs text-slate-400">
                  {offer.quantityMt} MT allocated
                </p>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-3">
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
              <TableCell className="px-4 py-4 text-slate-600">
                {offer.productGrade}
              </TableCell>
              <TableCell className="px-4 py-4 font-semibold tabular-nums text-slate-800">
                {formatCurrency(offer.basePrice)}
              </TableCell>
              <TableCell className="px-4 py-4 tabular-nums text-slate-600">
                {offer.moq} MT
              </TableCell>
              <TableCell className="px-4 py-4">
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
              <TableCell className="px-4 py-4">
                <OfferStatusBadge status={offer.status} />
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {offer.status === "paused" ? (
                        <DropdownMenuItem onClick={() => onResume(offer.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </DropdownMenuItem>
                      ) : null}
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
