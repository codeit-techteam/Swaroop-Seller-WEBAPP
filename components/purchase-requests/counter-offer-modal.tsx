"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import type {
  CounterOffer,
  CounterPaymentTerm,
  PurchaseRequest,
} from "@/types/purchase-requests";
import { COUNTER_PAYMENT_TERMS } from "@/types/purchase-requests";

const counterSchema = z.object({
  basePrice: z
    .string()
    .min(1, "Base price is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Enter a valid base price",
    }),
  moq: z
    .string()
    .min(1, "MOQ is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Enter a valid MOQ",
    }),
  availableQuantity: z
    .string()
    .min(1, "Available quantity is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Enter a valid quantity",
    }),
  dispatchDate: z.string().min(1, "Dispatch date is required"),
  paymentTerms: z.enum([
    "advance",
    "on_loading",
    "on_delivery",
    "credit_15",
    "credit_30",
  ]),
  remarks: z.string().optional(),
  bulkPricing: z.string().optional(),
});

type CounterFormValues = z.infer<typeof counterSchema>;

interface CounterOfferModalProps {
  open: boolean;
  request: PurchaseRequest | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (offer: Omit<CounterOffer, "submittedAt">) => void;
}

export function CounterOfferModal({
  open,
  request,
  onOpenChange,
  onSubmit,
}: CounterOfferModalProps) {
  const [preview, setPreview] = useState(false);

  const form = useForm<CounterFormValues>({
    resolver: zodResolver(counterSchema),
    defaultValues: {
      basePrice: "",
      moq: "",
      availableQuantity: "",
      dispatchDate: "",
      paymentTerms: "advance",
      remarks: "",
      bulkPricing: "",
    },
  });

  useEffect(() => {
    if (!request || !open) return;
    form.reset({
      basePrice: String(request.unitPrice),
      moq: String(Math.max(5, Math.round(request.quantityMt * 0.5))),
      availableQuantity: String(request.quantityMt),
      dispatchDate: request.deadline,
      paymentTerms: "advance",
      remarks: "",
      bulkPricing: "",
    });
    setPreview(false);
  }, [form, open, request]);

  if (!request) return null;

  const values = form.watch();
  const paymentLabel =
    COUNTER_PAYMENT_TERMS.find((t) => t.value === values.paymentTerms)?.label ??
    values.paymentTerms;

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      basePrice: Number(data.basePrice),
      moq: Number(data.moq),
      availableQuantity: Number(data.availableQuantity),
      dispatchDate: data.dispatchDate,
      paymentTerms: data.paymentTerms,
      remarks: data.remarks ?? "",
      bulkPricing: data.bulkPricing || undefined,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:max-w-none sm:rounded-none">
        <DialogHeader className="shrink-0 space-y-1 border-b border-slate-200 px-6 py-4 pr-12 text-left">
          <DialogTitle className="text-lg font-bold text-slate-900">
            Counter Offer
          </DialogTitle>
          <p className="text-sm text-slate-500">
            {request.requestNumber} · {request.productName} · Blind marketplace
            — no buyer contact shared
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            <form
              id="counter-offer-form"
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($ / MT)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    className="border-slate-200"
                    {...form.register("basePrice")}
                  />
                  {form.formState.errors.basePrice ? (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.basePrice.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moq">MOQ (MT)</Label>
                  <Input
                    id="moq"
                    type="number"
                    step="0.01"
                    className="border-slate-200"
                    {...form.register("moq")}
                  />
                  {form.formState.errors.moq ? (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.moq.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableQuantity">
                    Available Quantity (MT)
                  </Label>
                  <Input
                    id="availableQuantity"
                    type="number"
                    step="0.01"
                    className="border-slate-200"
                    {...form.register("availableQuantity")}
                  />
                  {form.formState.errors.availableQuantity ? (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.availableQuantity.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dispatchDate">Dispatch Date</Label>
                  <Input
                    id="dispatchDate"
                    type="date"
                    className="border-slate-200"
                    {...form.register("dispatchDate")}
                  />
                  {form.formState.errors.dispatchDate ? (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.dispatchDate.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select
                  value={values.paymentTerms}
                  onValueChange={(value) =>
                    form.setValue("paymentTerms", value as CounterPaymentTerm, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTER_PAYMENT_TERMS.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  className="min-h-[90px] border-slate-200"
                  placeholder="Optional notes for procurement..."
                  {...form.register("remarks")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkPricing">Bulk Pricing (optional)</Label>
                <Input
                  id="bulkPricing"
                  className="border-slate-200"
                  placeholder="e.g. $1,020 / MT above 40 MT"
                  {...form.register("bulkPricing")}
                />
              </div>
            </form>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Preview
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200"
                  onClick={() => setPreview((prev) => !prev)}
                >
                  {preview ? "Hide Preview" : "Show Preview"}
                </Button>
              </div>

              {preview ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Original Request
                    </p>
                    <p className="mt-2 font-medium text-slate-800">
                      {request.productGrade} · {request.quantityMt} MT
                    </p>
                    <p className="text-slate-500">
                      Req. ${request.unitPrice.toFixed(2)} / MT
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#1B6EF3]/30 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1B6EF3]">
                      Your Counter
                    </p>
                    <dl className="mt-3 space-y-2">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Base Price</dt>
                        <dd className="font-semibold text-slate-900">
                          ${Number(values.basePrice || 0).toFixed(2)} / MT
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">MOQ</dt>
                        <dd className="font-semibold text-slate-900">
                          {values.moq || "—"} MT
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Available Qty</dt>
                        <dd className="font-semibold text-slate-900">
                          {values.availableQuantity || "—"} MT
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Dispatch</dt>
                        <dd className="font-semibold text-slate-900">
                          {values.dispatchDate || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Payment</dt>
                        <dd className="font-semibold text-slate-900">
                          {paymentLabel}
                        </dd>
                      </div>
                      {values.bulkPricing ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Bulk Pricing</dt>
                          <dd className="font-semibold text-slate-900">
                            {values.bulkPricing}
                          </dd>
                        </div>
                      ) : null}
                      {values.remarks ? (
                        <div>
                          <dt className="text-slate-500">Remarks</dt>
                          <dd className="mt-1 text-slate-700">
                            {values.remarks}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  Toggle preview to review your counter against the original
                  request before submitting.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            form="counter-offer-form"
            type="submit"
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={handleSubmit}
          >
            Submit Counter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
