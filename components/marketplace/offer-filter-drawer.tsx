"use client";

import toast from "react-hot-toast";

import { ActionDrawer } from "@/components/erp/action-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  offerCategories,
  offerPaymentTerms,
  offerStatuses,
  offerWarehouses,
} from "@/mock/offers";
import { useOfferStore } from "@/store/offerStore";

interface OfferFilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function OfferFilterDrawer({ open, onClose }: OfferFilterDrawerProps) {
  const filters = useOfferStore((s) => s.filters);
  const setFilters = useOfferStore((s) => s.setFilters);
  const resetFilters = useOfferStore((s) => s.resetFilters);

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title="Advanced Filters"
      footer={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              resetFilters();
              toast.success("Filters reset");
            }}
          >
            Reset
          </Button>
          <Button
            className="flex-1 bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => {
              onClose();
              toast.success("Filters applied");
            }}
          >
            Apply
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {offerCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Warehouse</Label>
          <Select
            value={filters.warehouse}
            onValueChange={(value) => setFilters({ warehouse: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {offerWarehouses.map((wh) => (
                <SelectItem key={wh} value={wh}>
                  {wh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Offer Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {offerStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "All Statuses"
                    ? status
                    : status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Payment Terms</Label>
          <Select
            value={filters.paymentTerm}
            onValueChange={(value) => setFilters({ paymentTerm: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {offerPaymentTerms.map((term) => (
                <SelectItem key={term} value={term}>
                  {term === "All Payment Terms"
                    ? term
                    : term.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Validity From</Label>
            <Input
              type="date"
              value={filters.validityFrom}
              onChange={(e) => setFilters({ validityFrom: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Validity To</Label>
            <Input
              type="date"
              value={filters.validityTo}
              onChange={(e) => setFilters({ validityTo: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Created From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Created To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Price Min (₹)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.priceMin}
              onChange={(e) => setFilters({ priceMin: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price Max (₹)</Label>
            <Input
              type="number"
              placeholder="200000"
              value={filters.priceMax}
              onChange={(e) => setFilters({ priceMax: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>MOQ Min (MT)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.moqMin}
              onChange={(e) => setFilters({ moqMin: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>MOQ Max (MT)</Label>
            <Input
              type="number"
              placeholder="500"
              value={filters.moqMax}
              onChange={(e) => setFilters({ moqMax: e.target.value })}
            />
          </div>
        </div>
      </div>
    </ActionDrawer>
  );
}
