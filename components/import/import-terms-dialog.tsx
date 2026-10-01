"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useImportMaster, useImportPaymentTerms } from "@/hooks/use-import";
import {
  DECIMAL_PRICE,
  DECIMAL_QTY,
  importLabel,
  newIdempotencyKey,
  parseImportError,
} from "@/lib/import/format";
import type { ImportQuantityUnit, ImportTermsInput } from "@/types/import";

import { Field } from "./import-ui";

export type TermsDefaults = {
  price?: string | null;
  quantity?: string | null;
  paymentTermId?: string | null;
  esd?: string | null;
  lsd?: string | null;
  inspectionType?: string | null;
};

type TermsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  fixed: {
    currencyCode: string | null;
    priceUnit: ImportQuantityUnit | null;
    quantityUnit: ImportQuantityUnit | null;
    incoterm: string | null;
    priceBasis: string | null;
  };
  defaults: TermsDefaults;
  onSubmit: (terms: ImportTermsInput, idempotencyKey: string) => Promise<void>;
};

/**
 * Collects the terms for an opening offer or a counteroffer. Currency,
 * Incoterm and units are fixed by the listing and shown read-only.
 */
export function ImportTermsDialog(props: TermsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {/* Mounted per open, so the form starts from the latest defaults. */}
        {props.open ? <TermsForm {...props} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function TermsForm({
  onOpenChange,
  title,
  description,
  submitLabel,
  fixed,
  defaults,
  onSubmit,
}: TermsDialogProps) {
  const master = useImportMaster();
  const paymentTerms = useImportPaymentTerms(fixed.currencyCode);
  const [form, setForm] = useState<ImportTermsInput>(() => ({
    price: defaults.price ?? "",
    quantity: defaults.quantity ?? "",
    paymentTermId: defaults.paymentTermId ?? undefined,
    esd: defaults.esd ?? "",
    lsd: defaults.lsd ?? "",
    inspectionType: defaults.inspectionType ?? undefined,
    otherTerms: "",
    note: "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const keyRef = useRef<string | null>(null);

  const set = (key: keyof ImportTermsInput, value: string | undefined) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    const local: Record<string, string> = {};
    if (!form.price || !DECIMAL_PRICE.test(form.price))
      local.price = "Enter a price with up to 4 decimal places.";
    if (!form.quantity || !DECIMAL_QTY.test(form.quantity))
      local.quantity = "Enter a quantity with up to 3 decimal places.";
    if (form.esd && form.lsd && form.esd > form.lsd)
      local.lsd = "Latest shipment date must be on or after the earliest date.";
    setErrors(local);
    if (Object.keys(local).length) return;

    const payload: ImportTermsInput = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== undefined && v !== ""),
    );
    keyRef.current ??= newIdempotencyKey();
    setSubmitting(true);
    try {
      await onSubmit(payload, keyRef.current);
      keyRef.current = null;
      onOpenChange(false);
    } catch (error) {
      const e = parseImportError(error);
      if (e.status !== null) keyRef.current = null;
      if (e.fields.length) {
        setErrors(
          Object.fromEntries(e.fields.map((f) => [f.field, f.message])),
        );
      }
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const qtyUnit = importLabel(fixed.quantityUnit ?? "MT");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : null}
      </DialogHeader>

      <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Fixed by the listing: {fixed.currencyCode ?? "—"} per{" "}
        {importLabel(fixed.priceUnit ?? "MT")} · {fixed.incoterm ?? "—"}
        {fixed.priceBasis ? ` ${fixed.priceBasis}` : ""}. Prices are only
        compared on the same Incoterm and location.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={`Price (${fixed.currencyCode ?? ""} / ${importLabel(fixed.priceUnit ?? "MT")})`}
          required
          error={errors.price}
          htmlFor="t-price"
        >
          <Input
            id="t-price"
            inputMode="decimal"
            value={form.price ?? ""}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field
          label={`Quantity (${qtyUnit})`}
          required
          error={errors.quantity}
          htmlFor="t-quantity"
        >
          <Input
            id="t-quantity"
            inputMode="decimal"
            value={form.quantity ?? ""}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </Field>
        <Field
          label="Payment terms"
          error={errors.paymentTermId}
          className="sm:col-span-2"
        >
          <Select
            value={form.paymentTermId ?? ""}
            onValueChange={(v) => set("paymentTermId", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Keep listing terms" />
            </SelectTrigger>
            <SelectContent>
              {(paymentTerms.data ?? []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.displayName ?? t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Earliest shipment" error={errors.esd} htmlFor="t-esd">
          <Input
            id="t-esd"
            type="date"
            value={form.esd ?? ""}
            onChange={(e) => set("esd", e.target.value)}
          />
        </Field>
        <Field label="Latest shipment" error={errors.lsd} htmlFor="t-lsd">
          <Input
            id="t-lsd"
            type="date"
            value={form.lsd ?? ""}
            min={form.esd || undefined}
            onChange={(e) => set("lsd", e.target.value)}
          />
        </Field>
        <Field label="Inspection" error={errors.inspectionType}>
          <Select
            value={form.inspectionType ?? ""}
            onValueChange={(v) => set("inspectionType", v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Keep listing terms" />
            </SelectTrigger>
            <SelectContent>
              {(master.data?.enums.inspectionTypes ?? []).map((t) => (
                <SelectItem key={t} value={t}>
                  {importLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Other terms"
          error={errors.otherTerms}
          className="sm:col-span-2"
          htmlFor="t-other"
        >
          <Textarea
            id="t-other"
            rows={2}
            maxLength={3000}
            value={form.otherTerms ?? ""}
            onChange={(e) => set("otherTerms", e.target.value)}
          />
        </Field>
        <Field
          label="Message"
          error={errors.note}
          className="sm:col-span-2"
          htmlFor="t-note"
          hint="Do not share contact details — identities are revealed after the deal is confirmed."
        >
          <Textarea
            id="t-note"
            rows={2}
            maxLength={2000}
            value={form.note ?? ""}
            onChange={(e) => set("note", e.target.value)}
          />
        </Field>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={() => void submit()} disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
