"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { PurchaseRequest, RejectReason } from "@/types/purchase-requests";
import { REJECT_REASONS } from "@/types/purchase-requests";

interface RejectDialogProps {
  open: boolean;
  request: PurchaseRequest | null;
  reason: RejectReason | "";
  remark: string;
  onReasonChange: (reason: RejectReason | "") => void;
  onRemarkChange: (remark: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export function RejectDialog({
  open,
  request,
  reason,
  remark,
  onReasonChange,
  onRemarkChange,
  onOpenChange,
  onSubmit,
}: RejectDialogProps) {
  const [error, setError] = useState("");

  if (!request) return null;

  const handleSubmit = () => {
    if (!reason) {
      setError("Please select a rejection reason.");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Request</DialogTitle>
          <DialogDescription>
            Reject {request.requestNumber} ({request.productName}). Buyer
            contact details remain hidden in this blind marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Select
              value={reason || undefined}
              onValueChange={(value) => {
                setError("");
                onReasonChange(value as RejectReason);
              }}
            >
              <SelectTrigger id="reject-reason" className="border-slate-200">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reject-remark">Remark (optional)</Label>
            <Textarea
              id="reject-remark"
              value={remark}
              onChange={(event) => onRemarkChange(event.target.value)}
              placeholder="Add an optional note for procurement..."
              className="min-h-[90px] border-slate-200"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
