"use client";

import { useMemo, useState } from "react";

import { ActionDrawer } from "@/components/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatCompactInr } from "@/lib/utils";
import {
  BUYERS,
  COMMODITIES,
  GRADES,
  PAYMENT_TERMS,
  WAREHOUSES,
} from "@/modules/procurement/catalog";
import { nextPrId } from "@/modules/procurement/selectors";
import { useCustomerStore } from "@/store/customerStore";
import { useProcurementStore } from "@/store/procurementStore";
import { useUsersStore } from "@/store/usersStore";
import type { ProcurementPriority } from "@/types/procurement";

interface CreatePrDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (requestId: string) => void;
}

interface FormState {
  commodity: string;
  grade: string;
  quantity: string;
  quantityUnit: "MT" | "KG";
  requestedDeliveryDate: string;
  priority: ProcurementPriority;
  buyer: string;
  buyerCompany: string;
  destination: string;
  supplierId: string;
  unitPrice: string;
  warehouse: string;
  paymentTerms: string;
  creditRequired: boolean;
  reason: string;
  notes: string;
  internalRemarks: string;
}

const emptyForm: FormState = {
  commodity: "",
  grade: "",
  quantity: "",
  quantityUnit: "MT",
  requestedDeliveryDate: "",
  priority: "NORMAL",
  buyer: "",
  buyerCompany: "",
  destination: "",
  supplierId: "",
  unitPrice: "",
  warehouse: "Mundra",
  paymentTerms: "LC 45",
  creditRequired: false,
  reason: "",
  notes: "",
  internalRemarks: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export function CreatePrDrawer({
  open,
  onClose,
  onCreated,
}: CreatePrDrawerProps) {
  const items = useProcurementStore((s) => s.items);
  const createPurchaseRequest = useProcurementStore(
    (s) => s.createPurchaseRequest,
  );
  const suppliers = useUsersStore((s) => s.suppliers);
  const customers = useCustomerStore((s) => s.customers);
  const buyerOptions = useMemo(
    () => [
      ...customers.map((customer) => ({
        name: customer.name,
        company: customer.companyName,
        location: customer.city,
      })),
      ...BUYERS.filter(
        (buyer) => !customers.some((customer) => customer.name === buyer.name),
      ),
    ],
    [customers],
  );
  const previewId = useMemo(() => nextPrId(items), [items]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const grades = form.commodity ? (GRADES[form.commodity] ?? []) : [];
  const quantity = Number(form.quantity);
  const unitPrice = Number(form.unitPrice);
  const estimatedTotal =
    Number.isFinite(quantity) && Number.isFinite(unitPrice)
      ? quantity * unitPrice
      : 0;

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.commodity) next.commodity = "Commodity is required.";
    if (!form.grade) next.grade = "Product grade is required.";
    if (!form.buyer) next.buyer = "Buyer is required.";
    if (!form.quantity || !Number.isFinite(quantity) || quantity <= 0) {
      next.quantity = "Quantity must be a positive number.";
    }
    if (!form.unitPrice || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      next.unitPrice = "Unit price must be a positive number.";
    }
    if (!form.requestedDeliveryDate) {
      next.requestedDeliveryDate = "Required by date is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const supplier = suppliers.find((row) => row.id === form.supplierId);
  const payload = {
    commodity: form.commodity,
    grade: form.grade,
    quantity,
    quantityUnit: form.quantityUnit,
    requestedDeliveryDate: form.requestedDeliveryDate,
    priority: form.priority,
    buyer: form.buyer,
    buyerCompany: form.buyerCompany,
    destination: form.destination,
    supplierId: form.supplierId,
    supplier: supplier?.name ?? "",
    unitPrice,
    warehouse: form.warehouse,
    paymentTerms: form.paymentTerms,
    creditRequired: form.creditRequired,
    reason: form.reason,
    notes: form.notes,
    internalRemarks: form.internalRemarks,
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  const submit = (asDraft: boolean) => {
    if (!asDraft && !validate()) return;
    if (asDraft && !form.commodity && !form.buyer) {
      setErrors({
        commodity: "Add at least a commodity or buyer to save a draft.",
      });
      return;
    }
    const id = createPurchaseRequest({ ...payload, asDraft });
    resetAndClose();
    onCreated(id);
  };

  return (
    <ActionDrawer
      open={open}
      onClose={resetAndClose}
      title="Create Purchase Request"
      widthClassName="w-full max-w-2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => submit(true)}>
            Save Draft
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => submit(false)}
          >
            Create Purchase Request
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Request Details
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Request ID</Label>
              <Input className="mt-1.5" value={previewId} readOnly />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  patch("priority", value as ProcurementPriority)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commodity</Label>
              <Select
                value={form.commodity || undefined}
                onValueChange={(value) => {
                  patch("commodity", value);
                  patch("grade", "");
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent>
                  {COMMODITIES.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.commodity} />
            </div>
            <div>
              <Label>Product Grade</Label>
              <Select
                value={form.grade || undefined}
                onValueChange={(value) => patch("grade", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.grade} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                className="mt-1.5"
                inputMode="decimal"
                value={form.quantity}
                onChange={(event) => patch("quantity", event.target.value)}
                placeholder="120"
              />
              <FieldError message={errors.quantity} />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={form.quantityUnit}
                onValueChange={(value) =>
                  patch("quantityUnit", value as "MT" | "KG")
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT">MT</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Required By Date</Label>
              <Input
                className="mt-1.5"
                type="date"
                value={form.requestedDeliveryDate}
                onChange={(event) =>
                  patch("requestedDeliveryDate", event.target.value)
                }
              />
              <FieldError message={errors.requestedDeliveryDate} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Buyer Details
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Buyer / Customer</Label>
              <Select
                value={form.buyer || undefined}
                onValueChange={(value) => {
                  const buyer = buyerOptions.find((row) => row.name === value);
                  patch("buyer", value);
                  patch("buyerCompany", buyer?.company ?? "");
                  patch("destination", buyer?.location ?? form.destination);
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyerOptions.map((buyer) => (
                    <SelectItem key={buyer.name} value={buyer.name}>
                      {buyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.buyer} />
            </div>
            <div>
              <Label>Buyer Company</Label>
              <Input
                className="mt-1.5"
                value={form.buyerCompany}
                onChange={(event) => patch("buyerCompany", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Delivery Location / Destination</Label>
              <Input
                className="mt-1.5"
                value={form.destination}
                onChange={(event) => patch("destination", event.target.value)}
                placeholder="Warehouse / plant"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Procurement Details
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Preferred Supplier</Label>
              <Select
                value={form.supplierId || "none"}
                onValueChange={(value) =>
                  patch("supplierId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {suppliers.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {row.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Unit Price (INR)</Label>
              <Input
                className="mt-1.5"
                inputMode="decimal"
                value={form.unitPrice}
                onChange={(event) => patch("unitPrice", event.target.value)}
                placeholder="183333"
              />
              <FieldError message={errors.unitPrice} />
            </div>
            <div>
              <Label>Estimated Total Cost</Label>
              <Input
                className="mt-1.5"
                readOnly
                value={estimatedTotal ? formatCompactInr(estimatedTotal) : "—"}
              />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select
                value={form.warehouse}
                onValueChange={(value) => patch("warehouse", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSES.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Select
                value={form.paymentTerms}
                onValueChange={(value) => patch("paymentTerms", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
              <Label htmlFor="credit-required">Credit Required</Label>
              <Switch
                id="credit-required"
                checked={form.creditRequired}
                onCheckedChange={(checked) => patch("creditRequired", checked)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Additional Information
          </h3>
          <div className="mt-3 space-y-3">
            <div>
              <Label>Reason for Request</Label>
              <Textarea
                className="mt-1.5"
                value={form.reason}
                onChange={(event) => patch("reason", event.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1.5"
                value={form.notes}
                onChange={(event) => patch("notes", event.target.value)}
              />
            </div>
            <div>
              <Label>Internal Remarks</Label>
              <Textarea
                className="mt-1.5"
                value={form.internalRemarks}
                onChange={(event) =>
                  patch("internalRemarks", event.target.value)
                }
              />
            </div>
          </div>
        </section>
      </div>
    </ActionDrawer>
  );
}
