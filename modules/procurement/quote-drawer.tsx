"use client";

import { useState } from "react";

import { ActionDrawer } from "@/components/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProcurementItem, SubmitQuoteInput } from "@/types/procurement";

interface QuoteDrawerProps {
  item: ProcurementItem | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (input: SubmitQuoteInput) => void;
}

const empty = {
  availableQty: "",
  unitPrice: "",
  moq: "50",
  deliveryDays: "5",
  dispatchLocation: "",
  paymentTerms: "Net 30",
  creditTerms: "Net 30",
  validity: "7 days",
  remarks: "",
};

export function QuoteDrawer({ item, open, onClose, onSubmit }: QuoteDrawerProps) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const patch = (key: keyof typeof empty, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const close = () => {
    setForm(empty);
    setError("");
    onClose();
  };

  const payload = (): SubmitQuoteInput | null => {
    const unitPrice = Number(form.unitPrice);
    const availableQty = Number(form.availableQty);
    const moq = Number(form.moq);
    const deliveryDays = Number(form.deliveryDays);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      setError("Price / MT is required.");
      return null;
    }
    if (!Number.isFinite(availableQty) || availableQty <= 0) {
      setError("Available quantity is required.");
      return null;
    }
    return {
      unitPrice,
      availableQty,
      moq: Number.isFinite(moq) ? moq : 0,
      deliveryDays: Number.isFinite(deliveryDays) ? deliveryDays : 5,
      dispatchLocation: form.dispatchLocation,
      paymentTerms: form.paymentTerms,
      creditTerms: form.creditTerms,
      validity: form.validity,
      remarks: form.remarks,
    };
  };

  return (
    <ActionDrawer
      open={open}
      onClose={close}
      title={item ? `Submit quote · ${item.requestId}` : "Submit quote"}
      widthClassName="w-full max-w-xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const data = payload();
              if (!data) return;
              onSubmit({ ...data, asDraft: true });
              close();
            }}
          >
            Save Draft
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => {
              const data = payload();
              if (!data) return;
              onSubmit(data);
              close();
            }}
          >
            Submit Quote
          </Button>
        </div>
      }
    >
      {item ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Material</Label>
              <Input className="mt-1.5" readOnly value={item.commodity} />
            </div>
            <div>
              <Label>Grade</Label>
              <Input className="mt-1.5" readOnly value={item.grade} />
            </div>
            <div>
              <Label>Available Quantity (MT)</Label>
              <Input
                className="mt-1.5"
                value={form.availableQty}
                onChange={(event) => patch("availableQty", event.target.value)}
              />
            </div>
            <div>
              <Label>Price / MT</Label>
              <Input
                className="mt-1.5"
                value={form.unitPrice}
                onChange={(event) => patch("unitPrice", event.target.value)}
                placeholder="98800"
              />
            </div>
            <div>
              <Label>Minimum Order Quantity</Label>
              <Input
                className="mt-1.5"
                value={form.moq}
                onChange={(event) => patch("moq", event.target.value)}
              />
            </div>
            <div>
              <Label>Delivery Timeline (days)</Label>
              <Input
                className="mt-1.5"
                value={form.deliveryDays}
                onChange={(event) => patch("deliveryDays", event.target.value)}
              />
            </div>
            <div>
              <Label>Dispatch Location</Label>
              <Input
                className="mt-1.5"
                value={form.dispatchLocation}
                onChange={(event) => patch("dispatchLocation", event.target.value)}
              />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Input
                className="mt-1.5"
                value={form.paymentTerms}
                onChange={(event) => patch("paymentTerms", event.target.value)}
              />
            </div>
            <div>
              <Label>Quote Validity</Label>
              <Input
                className="mt-1.5"
                value={form.validity}
                onChange={(event) => patch("validity", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Total Price</Label>
              <Input
                className="mt-1.5"
                readOnly
                value={
                  Number(form.unitPrice) && item.quantityMt
                    ? `₹${Math.round(Number(form.unitPrice) * item.quantityMt).toLocaleString("en-IN")}`
                    : "—"
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Remarks</Label>
              <Textarea
                className="mt-1.5"
                value={form.remarks}
                onChange={(event) => patch("remarks", event.target.value)}
              />
            </div>
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      ) : null}
    </ActionDrawer>
  );
}
