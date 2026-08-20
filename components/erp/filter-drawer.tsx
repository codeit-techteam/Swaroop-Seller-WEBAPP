"use client";

import type { ReactNode } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardStore } from "@/store/dashboardStore";

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

export function FilterDrawer() {
  const open = useDashboardStore((s) => s.filterDrawerOpen);
  const setOpen = useDashboardStore((s) => s.setFilterDrawerOpen);
  const filters = useDashboardStore((s) => s.filters);
  const setFilters = useDashboardStore((s) => s.setFilters);
  const applyFilters = useDashboardStore((s) => s.applyFilters);
  const resetFilters = useDashboardStore((s) => s.resetFilters);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden border-slate-200 p-0 sm:max-w-[440px]">
        <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
          <DialogTitle className="text-base text-slate-900">
            Filter dashboard
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Narrow transactions by period, location, product and status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 py-4">
          <FieldGroup title="Period">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateFrom" className="text-slate-600">
                  From
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) =>
                    setFilters({ dateFrom: event.target.value })
                  }
                  className="h-9 border-slate-200 bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dateTo" className="text-slate-600">
                  To
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) =>
                    setFilters({ dateTo: event.target.value })
                  }
                  className="h-9 border-slate-200 bg-slate-50"
                />
              </div>
            </div>
          </FieldGroup>

          <FieldGroup title="Scope">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-slate-600">Warehouse</Label>
                <Select
                  value={filters.warehouse}
                  onValueChange={(value) => setFilters({ warehouse: value })}
                >
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="hazira">Hazira Complex</SelectItem>
                    <SelectItem value="mundra">Mundra Terminal 3</SelectItem>
                    <SelectItem value="jnpt">JNPT Warehouse B</SelectItem>
                    <SelectItem value="kandla">Kandla Bulk Yard</SelectItem>
                    <SelectItem value="panipat">Panipat Depot</SelectItem>
                    <SelectItem value="mumbai">Mumbai CFS Hub</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Product</Label>
                <Select
                  value={filters.product}
                  onValueChange={(value) => setFilters({ product: value })}
                >
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="polypropylene">Polypropylene</SelectItem>
                    <SelectItem value="crude">Crude Oil</SelectItem>
                    <SelectItem value="lng">Natural Gas</SelectItem>
                    <SelectItem value="petcoke">PetCoke</SelectItem>
                    <SelectItem value="fuel">Heavy Fuel Oil</SelectItem>
                    <SelectItem value="pvc">PVC</SelectItem>
                    <SelectItem value="hdpe">HDPE</SelectItem>
                    <SelectItem value="lldpe">LLDPE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FieldGroup>

          <FieldGroup title="Status">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-600">Order status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ status: value })}
                >
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="SOURCED">Sourced</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Settlement</Label>
                <Select
                  value={filters.settlement}
                  onValueChange={(value) => setFilters({ settlement: value })}
                >
                  <SelectTrigger className="h-9 border-slate-200 bg-slate-50">
                    <SelectValue placeholder="Select settlement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Settlements</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FieldGroup>
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:space-x-0">
          <Button
            variant="outline"
            className="flex-1 border-slate-200 bg-white sm:flex-1"
            onClick={() => {
              resetFilters();
              toast.success("Filters reset");
            }}
          >
            Reset
          </Button>
          <Button
            className="flex-1 bg-[#1B6EF3] hover:bg-[#1558C8] sm:flex-1"
            onClick={() => {
              applyFilters(filters);
              toast.success("Filters applied");
            }}
          >
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
