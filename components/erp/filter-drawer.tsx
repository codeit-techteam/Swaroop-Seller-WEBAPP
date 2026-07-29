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
import { useDashboardStore } from "@/store/dashboardStore";

export function FilterDrawer() {
  const open = useDashboardStore((s) => s.filterDrawerOpen);
  const setOpen = useDashboardStore((s) => s.setFilterDrawerOpen);
  const filters = useDashboardStore((s) => s.filters);
  const setFilters = useDashboardStore((s) => s.setFilters);
  const applyFilters = useDashboardStore((s) => s.applyFilters);
  const resetFilters = useDashboardStore((s) => s.resetFilters);

  return (
    <ActionDrawer
      open={open}
      onClose={() => setOpen(false)}
      title="Filter Dashboard"
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
              applyFilters(filters);
              toast.success("Filters applied");
            }}
          >
            Apply
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilters({ dateFrom: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilters({ dateTo: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Warehouse</Label>
          <Select
            value={filters.warehouse}
            onValueChange={(value) => setFilters({ warehouse: value })}
          >
            <SelectTrigger>
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
          <Label>Product</Label>
          <Select
            value={filters.product}
            onValueChange={(value) => setFilters({ product: value })}
          >
            <SelectTrigger>
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

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ status: value })}
          >
            <SelectTrigger>
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
          <Label>Settlement</Label>
          <Select
            value={filters.settlement}
            onValueChange={(value) => setFilters({ settlement: value })}
          >
            <SelectTrigger>
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
    </ActionDrawer>
  );
}
