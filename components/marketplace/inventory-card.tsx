"use client";

import { ShoppingBag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { warehouses } from "@/mock/products";
import type { ProductInventory } from "@/types/products";

interface InventoryCardProps {
  inventory: ProductInventory;
  onChange: (data: Partial<ProductInventory>) => void;
  errors?: Record<string, string>;
}

export function InventoryCard({
  inventory,
  onChange,
  errors,
}: InventoryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
      <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <ShoppingBag className="h-4 w-4 text-[#0B1F3A]" />
        <h3 className="text-sm font-semibold text-slate-800">Inventory</h3>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Warehouse Location
          </Label>
          <Select
            value={inventory.warehouseId}
            onValueChange={(value) => {
              const wh = warehouses.find((w) => w.id === value);
              onChange({
                warehouseId: value,
                warehouseName: wh?.name ?? "",
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name} ({wh.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.warehouseId ? (
            <p className="text-xs text-red-500">{errors.warehouseId}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Available (MT)
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={inventory.availableMt || ""}
              onChange={(e) =>
                onChange({ availableMt: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              MOQ (MT)
            </Label>
            <Input
              type="number"
              min={1}
              value={inventory.moq || ""}
              onChange={(e) =>
                onChange({ moq: parseFloat(e.target.value) || 0 })
              }
            />
            {errors?.moq ? (
              <p className="text-xs text-red-500">{errors.moq}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Stock Unit
            </Label>
            <Input
              value={inventory.stockUnit}
              disabled
              className="bg-slate-50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <Label className="text-sm font-medium text-slate-700">
            Inventory Status
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {inventory.isActive ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={inventory.isActive}
              onCheckedChange={(checked) => onChange({ isActive: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
