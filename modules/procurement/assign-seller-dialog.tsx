"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUsersStore } from "@/store/usersStore";
import type { ProcurementItem } from "@/types/procurement";

interface AssignSellerDialogProps {
  item: ProcurementItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (sellers: Array<{ id: string; name: string }>) => void;
}

export function AssignSellerDialog({
  item,
  open,
  onClose,
  onConfirm,
}: AssignSellerDialogProps) {
  const suppliers = useUsersStore((s) => s.suppliers);
  const [selected, setSelected] = useState<string[]>([]);
  const options = useMemo(
    () => suppliers.filter((row) => row.status === "ACTIVE" || row.status === "ONBOARDING"),
    [suppliers],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelected([]);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign sellers / send RFQ</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          {item
            ? `Select suppliers for ${item.requestId} · ${item.commodity} ${item.grade}`
            : "Select suppliers"}
        </p>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {options.map((supplier) => {
            const checked = selected.includes(supplier.id);
            return (
              <button
                key={supplier.id}
                type="button"
                onClick={() =>
                  setSelected((current) =>
                    checked
                      ? current.filter((id) => id !== supplier.id)
                      : [...current, supplier.id],
                  )
                }
                className={cn(
                  "flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left",
                  checked
                    ? "border-[#1B6EF3] bg-[#F5F9FF]"
                    : "border-slate-200 bg-white",
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {supplier.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {supplier.location} · {supplier.commodities}
                  </p>
                </div>
                <span className="text-[11px] font-semibold uppercase text-slate-500">
                  {supplier.kyc}
                </span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            disabled={!selected.length}
            onClick={() => {
              onConfirm(
                options
                  .filter((row) => selected.includes(row.id))
                  .map((row) => ({ id: row.id, name: row.name })),
              );
              setSelected([]);
            }}
          >
            Send RFQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
