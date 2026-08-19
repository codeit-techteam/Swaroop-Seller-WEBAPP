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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { REJECTION_REASONS } from "@/modules/procurement/catalog";
import type { ProcurementItem, RejectionReason } from "@/types/procurement";

interface RejectDialogProps {
  item: ProcurementItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: RejectionReason, remarks: string) => void;
}

export function RejectDialog({
  item,
  open,
  onClose,
  onConfirm,
}: RejectDialogProps) {
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setReason("");
    setRemarks("");
    setError("");
    onClose();
  };

  const handleConfirm = () => {
    if (!reason) {
      setError("Rejection reason is required.");
      return;
    }
    onConfirm(reason, remarks);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Purchase Request</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          {item
            ? `Reject ${item.requestId} · ${item.commodity} ${item.grade}`
            : "Select a rejection reason."}
        </p>
        <div className="space-y-3">
          <div>
            <Label>Rejection Reason</Label>
              <Select
                value={reason || undefined}
                onValueChange={(value) => {
                setReason(value as RejectionReason);
                setError("");
              }}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
          <div>
            <Label>Remarks (optional)</Label>
            <Textarea
              className="mt-1.5"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Reject Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
