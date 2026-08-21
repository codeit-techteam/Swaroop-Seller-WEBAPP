"use client";

import { motion } from "framer-motion";
import { Copy, Gem, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";
import type { PricingTier } from "@/types/offers";

interface PricingTierCardProps {
  tier: PricingTier;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate: (data: Partial<PricingTier>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  canDelete?: boolean;
  dragIndex?: number | null;
  onDragStart?: (index: number) => void;
  onDragOver?: (index: number) => void;
  onDragEnd?: () => void;
}

function formatTierRange(tier: PricingTier): string {
  if (tier.maxQty === null) {
    return `${tier.minQty}+ MT`;
  }
  return `${tier.minQty}-${tier.maxQty} MT`;
}

export function PricingTierCard({
  tier,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  canDelete,
  dragIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
}: PricingTierCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      draggable
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(index);
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        "relative min-w-[220px] flex-1 cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all",
        isSelected
          ? "border-2 border-[#1B6EF3] ring-2 ring-[#1B6EF3]/20"
          : "border-slate-200 hover:border-slate-300",
        dragIndex === index && "opacity-60",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex gap-1">
          {onDuplicate ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-[#1B6EF3]"
              aria-label="Duplicate tier"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {canDelete && onDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Delete tier"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {tier.label} ({formatTierRange(tier)})
      </p>

      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-slate-400">Min Qty</Label>
            <Input
              type="number"
              min={0}
              className="mt-0.5 h-8 text-sm"
              value={tier.minQty}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                onUpdate({ minQty: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">Max Qty</Label>
            <Input
              type="number"
              min={0}
              className="mt-0.5 h-8 text-sm"
              placeholder="∞"
              value={tier.maxQty ?? ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                onUpdate({
                  maxQty:
                    e.target.value === ""
                      ? null
                      : parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] text-slate-400">Discount %</Label>
          <div className="relative mt-0.5">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.1"
              className="h-8 pr-6 text-sm"
              value={tier.discountPercent}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                onUpdate({ discountPercent: parseFloat(e.target.value) || 0 })
              }
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              %
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-slate-400">Unit Price (₹)</p>
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(tier.unitPrice)}
          </p>
        </div>
      </div>

      <p
        className={cn(
          "mt-2 text-xs",
          tier.savingsPerMt > 0 ? "text-emerald-600" : "text-slate-400",
        )}
      >
        {tier.savingsPerMt > 0
          ? `Save ${formatCurrency(tier.savingsPerMt)}/MT`
          : index === 0
            ? "No savings for base tier"
            : "No savings"}
      </p>
    </motion.div>
  );
}

interface TierBuilderProps {
  tiers: PricingTier[];
  basePrice: number;
  selectedTierId?: string;
  onSelectTier?: (tierId: string) => void;
  onUpdateTier: (tierId: string, data: Partial<PricingTier>) => void;
  onAddTier: () => void;
  onRemoveTier: (tierId: string) => void;
  onDuplicateTier?: (tierId: string) => void;
  onReorderTiers?: (fromIndex: number, toIndex: number) => void;
  overlapError?: string;
}

export function TierBuilder({
  tiers,
  basePrice,
  selectedTierId,
  onSelectTier,
  onUpdateTier,
  onAddTier,
  onRemoveTier,
  onDuplicateTier,
  onReorderTiers,
  overlapError,
}: TierBuilderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A]/5">
            <Gem className="h-4 w-4 text-[#0B1F3A]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              3. Bulk Pricing Builder
            </h2>
            <p className="text-xs text-slate-400">
              Volume discounts auto-calculate unit price
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
          Dynamic Savings
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {tiers.map((tier, index) => (
          <PricingTierCard
            key={tier.id}
            tier={tier}
            index={index}
            isSelected={selectedTierId === tier.id}
            onSelect={() => onSelectTier?.(tier.id)}
            onUpdate={(data) => onUpdateTier(tier.id, data)}
            onDelete={() => onRemoveTier(tier.id)}
            onDuplicate={
              onDuplicateTier ? () => onDuplicateTier(tier.id) : undefined
            }
            canDelete={tiers.length > 1}
            dragIndex={dragIndex}
            onDragStart={setDragIndex}
            onDragOver={(overIndex) => {
              if (dragIndex === null || dragIndex === overIndex) return;
              onReorderTiers?.(dragIndex, overIndex);
              setDragIndex(overIndex);
            }}
            onDragEnd={() => setDragIndex(null)}
          />
        ))}

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddTier}
          className="flex min-w-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-slate-500 transition-colors hover:border-[#1B6EF3] hover:bg-blue-50/30 hover:text-[#1B6EF3]"
        >
          <Plus className="mb-2 h-6 w-6" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Add Custom Tier
          </span>
        </motion.button>
      </div>

      {overlapError ? (
        <p className="text-xs text-red-500">{overlapError}</p>
      ) : null}

      {basePrice > 0 ? (
        <p className="text-xs text-slate-400">
          Base price: {formatCurrency(basePrice)} — drag tiers to reorder ·
          discounts auto-calculate unit price
        </p>
      ) : null}
    </div>
  );
}
