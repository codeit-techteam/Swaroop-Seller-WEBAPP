"use client";

import { format, parseISO } from "date-fns";
import {
  Building2,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SellerProfile } from "@/types/profile";

interface PreviewModalProps {
  open: boolean;
  seller: SellerProfile | null;
  onOpenChange: (open: boolean) => void;
}

export function PreviewModal({
  open,
  seller,
  onOpenChange,
}: PreviewModalProps) {
  if (!seller) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Public Profile Preview</DialogTitle>
          <DialogDescription>
            This is how buyers see your seller profile on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1B3A5C] px-6 py-8 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-lg font-bold">
                {seller.logoInitials}
              </div>
              <div>
                <h3 className="text-xl font-bold">{seller.companyName}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {seller.sellerRating.toFixed(1)}/
                    {seller.maxRating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Since {seller.partnerSince}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {seller.headquarters}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <p className="text-sm leading-relaxed text-slate-600">
              {seller.description}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={Building2}
                label="Business Type"
                value={seller.businessType}
              />
              <InfoRow
                icon={Calendar}
                label="Years in Business"
                value={`${seller.yearsInBusiness} years`}
              />
              <InfoRow icon={Mail} label="Email" value={seller.email} />
              <InfoRow icon={Phone} label="Phone" value={seller.phone} />
              <InfoRow icon={Globe} label="Website" value={seller.website} />
              <InfoRow icon={MapPin} label="Address" value={seller.address} />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Product Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {seller.primaryCategories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-md bg-[#E8F1FF] px-2.5 py-1 text-xs font-medium text-[#1B6EF3]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Warehouses
              </p>
              <ul className="space-y-1 text-sm text-slate-700">
                {seller.warehouses.map((wh) => (
                  <li key={wh.id}>
                    {wh.label}
                    {wh.isPrimary ? " (Primary)" : ""}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-400">
              Last updated{" "}
              {format(parseISO(seller.lastUpdatedAt), "dd MMM yyyy")}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
