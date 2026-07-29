"use client";

import { useState } from "react";

import { ConfirmationModal } from "@/components/offer-review/confirmation-modal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OfferReview } from "@/types/offer-review";

interface WithdrawModalProps {
  open: boolean;
  offer: OfferReview | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function WithdrawModal({
  open,
  offer,
  onClose,
  onConfirm,
}: WithdrawModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setReason("");
      onClose();
    }
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Withdraw Offer"
      description={
        offer
          ? `Are you sure you want to withdraw offer ${offer.offerId}? This action cannot be undone.`
          : "Are you sure you want to withdraw this offer?"
      }
      confirmLabel="Withdraw Offer"
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={handleConfirm}
    >
      <div className="space-y-2 py-2">
        <Label htmlFor="withdraw-reason">Reason for withdrawal</Label>
        <Textarea
          id="withdraw-reason"
          placeholder="Please provide a reason for withdrawing this offer..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
        />
      </div>
    </ConfirmationModal>
  );
}
