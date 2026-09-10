"use client";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
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
import { Textarea } from "@/components/ui/textarea";
import { COUNTER_VALIDITY_OPTIONS } from "@/types/seller-ops";

export function CounterOfferModal({
  open,
  busy,
  price,
  reason,
  validity,
  terms,
  onPriceChange,
  onReasonChange,
  onValidityChange,
  onTermsChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  price: string;
  reason: string;
  validity: string;
  terms: string;
  onPriceChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onValidityChange: (value: string) => void;
  onTermsChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const disabled = busy || !price.trim() || !reason.trim() || !validity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit counter offer</DialogTitle>
          <DialogDescription>
            Propose an alternate price. The buyer will see this as a counter
            offer against the original request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="counter-price">Counter Price (₹/kg)</Label>
            <Input
              id="counter-price"
              type="number"
              min="1"
              step="0.5"
              value={price}
              onChange={(event) => onPriceChange(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="counter-reason">Reason</Label>
            <Textarea
              id="counter-reason"
              rows={3}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Validity</Label>
            <Select value={validity} onValueChange={onValidityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select validity" />
              </SelectTrigger>
              <SelectContent>
                {COUNTER_VALIDITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="counter-terms">Additional Terms</Label>
            <Textarea
              id="counter-terms"
              rows={2}
              value={terms}
              onChange={(event) => onTermsChange(event.target.value)}
            />
          </div>
          {validity ? <SellerStatusBadge status="COUNTER_OFFER" /> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            disabled={disabled}
            onClick={onSubmit}
          >
            {busy ? "Submitting..." : "Submit Counter Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
