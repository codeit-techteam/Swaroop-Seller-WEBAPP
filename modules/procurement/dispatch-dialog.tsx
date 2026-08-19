"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DispatchInput, ProcurementItem } from "@/types/procurement";

interface DispatchDialogProps {
  item: ProcurementItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (input: DispatchInput) => void;
}

export function DispatchDialog({
  item,
  open,
  onClose,
  onConfirm,
}: DispatchDialogProps) {
  const [vehicle, setVehicle] = useState("");
  const [lrNumber, setLrNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [eta, setEta] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    setVehicle("");
    setLrNumber("");
    setOrigin("");
    setEta("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record dispatch</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          {item ? `${item.poId ?? item.id} · ${item.supplier}` : ""}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Vehicle / carrier</Label>
            <Input className="mt-1.5" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
          </div>
          <div>
            <Label>LR / AWB number</Label>
            <Input className="mt-1.5" value={lrNumber} onChange={(e) => setLrNumber(e.target.value)} />
          </div>
          <div>
            <Label>Dispatch location</Label>
            <Input className="mt-1.5" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </div>
          <div>
            <Label>ETA</Label>
            <Input className="mt-1.5" type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
          </div>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => {
              if (!vehicle || !lrNumber) {
                setError("Vehicle and LR number are required.");
                return;
              }
              onConfirm({ vehicle, lrNumber, origin, eta });
              close();
            }}
          >
            Confirm dispatch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
