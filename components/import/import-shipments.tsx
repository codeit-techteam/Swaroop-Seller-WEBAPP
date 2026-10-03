"use client";

import {
  AlertTriangle,
  ListPlus,
  Loader2,
  MapPin,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddShipmentEvent,
  useCreateShipment,
  useImportMaster,
  useImportShipments,
  useUpdateShipment,
} from "@/hooks/use-import";
import { useDebounce } from "@/hooks/useDebounce";
import { IMPORT_OWN_PARTY, IMPORT_ROUTES } from "@/lib/import/config";
import {
  DECIMAL_QTY,
  formatDate,
  formatDateTime,
  formatQty,
  type ImportApiError,
  importLabel,
  milliToQty,
  newIdempotencyKey,
  parseImportError,
  qtyToMilli,
  toLocalDateTimeInput,
} from "@/lib/import/format";
import { cn } from "@/lib/utils";
import type {
  ImportDealDetail,
  ImportDealStatus,
  ImportShipment,
  ImportShipmentDetailsInput,
  ImportShipmentEvent,
  ImportShipmentMode,
  ImportShipmentStatus,
} from "@/types/import";

import {
  ErrorPanel,
  Field,
  ImportPage,
  ImportStatusBadge,
  KeyValueGrid,
  Pager,
} from "./import-ui";

const SHIPMENT_STATUSES: ImportShipmentStatus[] = [
  "BOOKED",
  "SHIPPED",
  "IN_TRANSIT",
  "ARRIVED",
  "CUSTOMS_CLEARANCE",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "EXCEPTION",
  "CANCELLED",
];

const SHIPMENT_MODES: ImportShipmentMode[] = [
  "SEA",
  "AIR",
  "ROAD",
  "RAIL",
  "MULTIMODAL",
];

const TERMINAL_STATUSES: ImportShipmentStatus[] = ["DELIVERED", "CANCELLED"];
const SHIPPABLE_DEAL_STATUSES: ImportDealStatus[] = [
  "CONFIRMED",
  "PARTIALLY_FULFILLED",
];

const CONFLICT_MESSAGE =
  "This shipment was updated by someone else — reloaded latest";

/** ETD/ETA are calendar dates; reading the UTC date keeps them from shifting. */
const shipDate = (iso: string | null) =>
  iso ? formatDate(iso.slice(0, 10)) : null;

const etaLabel = (iso: string | null) =>
  iso ? `ETA ${shipDate(iso)}` : "ETA not available yet";

/** Backend field paths (e.g. `containerNumbers.2`) mapped to form keys. */
function fieldErrors(error: ImportApiError): Record<string, string> {
  return Object.fromEntries(
    error.fields.map((f) => [f.field.split(/[.[]/)[0] ?? f.field, f.message]),
  );
}

// Details form (book + edit) ----------------------------------------------------

type DetailsForm = {
  mode: ImportShipmentMode;
  carrierName: string;
  trackingNumber: string;
  vesselName: string;
  voyageNumber: string;
  containerNumbers: string;
  originLocation: string;
  destinationLocation: string;
  etd: string;
  eta: string;
  remarks: string;
};

function detailsFrom(s?: ImportShipment): DetailsForm {
  return {
    mode: s?.mode ?? "SEA",
    carrierName: s?.carrierName ?? "",
    trackingNumber: s?.trackingNumber ?? "",
    vesselName: s?.vesselName ?? "",
    voyageNumber: s?.voyageNumber ?? "",
    containerNumbers: s?.containerNumbers.join("\n") ?? "",
    originLocation: s?.originLocation ?? "",
    destinationLocation: s?.destinationLocation ?? "",
    etd: s?.etd?.slice(0, 10) ?? "",
    eta: s?.eta?.slice(0, 10) ?? "",
    remarks: s?.remarks ?? "",
  };
}

function parseContainers(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[\n,;]+/)
        .map((c) => c.trim())
        .filter(Boolean),
    ),
  );
}

function validateDetails(form: DetailsForm): Record<string, string> {
  const errors: Record<string, string> = {};
  const containers = parseContainers(form.containerNumbers);
  if (containers.length > 200) {
    errors.containerNumbers = "Enter at most 200 container numbers.";
  } else if (containers.some((c) => c.length > 20)) {
    errors.containerNumbers =
      "Each container number can be at most 20 characters.";
  }
  if (form.etd && form.eta && form.eta < form.etd) {
    errors.eta = "ETA must be on or after the ETD.";
  }
  return errors;
}

/**
 * `clear` sends `null` for emptied fields (edit); otherwise they are omitted
 * so the server applies its defaults (e.g. origin/destination from the deal).
 */
function detailsPayload(
  form: DetailsForm,
  clear: boolean,
): ImportShipmentDetailsInput {
  const text = (value: string) => value.trim() || (clear ? null : undefined);
  const containers = parseContainers(form.containerNumbers);
  return {
    mode: form.mode,
    carrierName: text(form.carrierName),
    trackingNumber: text(form.trackingNumber),
    vesselName: text(form.vesselName),
    voyageNumber: text(form.voyageNumber),
    containerNumbers: clear || containers.length ? containers : undefined,
    originLocation: text(form.originLocation),
    destinationLocation: text(form.destinationLocation),
    etd: text(form.etd),
    eta: text(form.eta),
    remarks: text(form.remarks),
  };
}

function DetailsFields({
  form,
  onChange,
  errors,
  creating,
}: {
  form: DetailsForm;
  onChange: (patch: Partial<DetailsForm>) => void;
  errors: Record<string, string>;
  creating: boolean;
}) {
  const master = useImportMaster();
  const modes = master.data?.enums.shipmentModes?.length
    ? master.data.enums.shipmentModes
    : SHIPMENT_MODES;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Mode" error={errors.mode}>
        <Select
          value={form.mode}
          onValueChange={(v) => onChange({ mode: v as ImportShipmentMode })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modes.map((m) => (
              <SelectItem key={m} value={m}>
                {importLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Carrier" error={errors.carrierName} htmlFor="s-carrier">
        <Input
          id="s-carrier"
          maxLength={120}
          placeholder="Shipping line, airline or transporter"
          value={form.carrierName}
          onChange={(e) => onChange({ carrierName: e.target.value })}
        />
      </Field>
      <Field
        label="Tracking number"
        error={errors.trackingNumber}
        hint="B/L, AWB or LR number from your logistics partner"
        htmlFor="s-tracking"
      >
        <Input
          id="s-tracking"
          maxLength={80}
          placeholder="B/L / AWB / LR number"
          value={form.trackingNumber}
          onChange={(e) => onChange({ trackingNumber: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vessel" error={errors.vesselName} htmlFor="s-vessel">
          <Input
            id="s-vessel"
            maxLength={120}
            value={form.vesselName}
            onChange={(e) => onChange({ vesselName: e.target.value })}
          />
        </Field>
        <Field label="Voyage" error={errors.voyageNumber} htmlFor="s-voyage">
          <Input
            id="s-voyage"
            maxLength={40}
            value={form.voyageNumber}
            onChange={(e) => onChange({ voyageNumber: e.target.value })}
          />
        </Field>
      </div>
      <Field
        label="Container numbers"
        error={errors.containerNumbers}
        hint="One per line or separated by commas"
        className="sm:col-span-2"
        htmlFor="s-containers"
      >
        <Textarea
          id="s-containers"
          rows={2}
          placeholder="MSKU1234565, TGHU7654321"
          value={form.containerNumbers}
          onChange={(e) => onChange({ containerNumbers: e.target.value })}
        />
      </Field>
      <Field label="Origin" error={errors.originLocation} htmlFor="s-origin">
        <Input
          id="s-origin"
          maxLength={160}
          placeholder={
            creating ? "Defaults to the deal's port of loading" : undefined
          }
          value={form.originLocation}
          onChange={(e) => onChange({ originLocation: e.target.value })}
        />
      </Field>
      <Field
        label="Destination"
        error={errors.destinationLocation}
        htmlFor="s-destination"
      >
        <Input
          id="s-destination"
          maxLength={160}
          placeholder={
            creating ? "Defaults to the deal's port of discharge" : undefined
          }
          value={form.destinationLocation}
          onChange={(e) => onChange({ destinationLocation: e.target.value })}
        />
      </Field>
      <Field label="ETD" error={errors.etd} htmlFor="s-etd">
        <Input
          id="s-etd"
          type="date"
          value={form.etd}
          onChange={(e) => onChange({ etd: e.target.value })}
        />
      </Field>
      <Field
        label="ETA"
        error={errors.eta}
        hint="Leave empty until the carrier gives one"
        htmlFor="s-eta"
      >
        <Input
          id="s-eta"
          type="date"
          min={form.etd || undefined}
          value={form.eta}
          onChange={(e) => onChange({ eta: e.target.value })}
        />
      </Field>
      <Field
        label="Remarks"
        error={errors.remarks}
        className="sm:col-span-2"
        htmlFor="s-remarks"
      >
        <Textarea
          id="s-remarks"
          rows={2}
          maxLength={2000}
          value={form.remarks}
          onChange={(e) => onChange({ remarks: e.target.value })}
        />
      </Field>
    </div>
  );
}

function BookShipmentForm({
  deal,
  remaining,
  onDone,
}: {
  deal: ImportDealDetail;
  remaining: bigint;
  onDone: () => void;
}) {
  const create = useCreateShipment();
  const [idempotencyKey] = useState(newIdempotencyKey);
  const [quantity, setQuantity] = useState(() => milliToQty(remaining));
  const [form, setForm] = useState(() => detailsFrom());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const maxLabel = formatQty(milliToQty(remaining), deal.quantityUnit);

  async function submit() {
    const local = validateDetails(form);
    const qty = quantity.trim();
    if (!DECIMAL_QTY.test(qty) || qtyToMilli(qty) <= BigInt(0)) {
      local.quantity = "Enter a quantity above 0 with up to 3 decimals.";
    } else if (qtyToMilli(qty) > remaining) {
      local.quantity = `Only ${maxLabel} of this deal is still unshipped.`;
    }
    setErrors(local);
    if (Object.keys(local).length) return;
    try {
      const shipment = await create.mutateAsync({
        dealId: deal.id,
        body: { quantity: qty, ...detailsPayload(form, false) },
        idempotencyKey,
      });
      toast.success(`Shipment ${shipment.referenceNumber} booked`);
      onDone();
    } catch (error) {
      const e = parseImportError(error);
      setErrors(fieldErrors(e));
      toast.error(e.message);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Book a shipment</DialogTitle>
        <DialogDescription>
          Enter the details your logistics partner gave you. You can add
          tracking numbers, vessel and ETA later as they become available.
        </DialogDescription>
      </DialogHeader>
      <Field
        label={`Quantity (${importLabel(deal.quantityUnit)})`}
        required
        error={errors.quantity}
        hint={`Up to ${maxLabel} remaining on deal ${deal.referenceNumber}`}
        htmlFor="s-quantity"
      >
        <Input
          id="s-quantity"
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </Field>
      <DetailsFields
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        errors={errors}
        creating
      />
      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
        <Button onClick={() => void submit()} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="animate-spin" /> : null}
          Book shipment
        </Button>
      </DialogFooter>
    </>
  );
}

function ShipmentEditForm({
  shipment,
  onDone,
}: {
  shipment: ImportShipment;
  onDone: () => void;
}) {
  const update = useUpdateShipment();
  const [form, setForm] = useState(() => detailsFrom(shipment));
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit() {
    const local = validateDetails(form);
    setErrors(local);
    if (Object.keys(local).length) return;
    try {
      await update.mutateAsync({
        id: shipment.id,
        body: { ...detailsPayload(form, true), version: shipment.version },
      });
      toast.success("Shipment details saved");
      onDone();
    } catch (error) {
      const e = parseImportError(error);
      if (e.code === "IMPORT_DRAFT_CONFLICT") {
        toast.error(CONFLICT_MESSAGE);
        onDone();
        return;
      }
      setErrors(fieldErrors(e));
      toast.error(e.message);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit {shipment.referenceNumber}</DialogTitle>
        <DialogDescription>
          Carrier, routing and schedule details. Quantity and status cannot be
          changed here.
        </DialogDescription>
      </DialogHeader>
      <DetailsFields
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        errors={errors}
        creating={false}
      />
      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={update.isPending}>
          Cancel
        </Button>
        <Button onClick={() => void submit()} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="animate-spin" /> : null}
          Save details
        </Button>
      </DialogFooter>
    </>
  );
}

function ShipmentEventForm({
  shipment,
  mode,
  onDone,
}: {
  shipment: ImportShipment;
  mode: "status" | "note";
  onDone: () => void;
}) {
  const add = useAddShipmentEvent();
  const [defaultAt] = useState(() => toLocalDateTimeInput(new Date()));
  const [status, setStatus] = useState<ImportShipmentStatus | "">("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(defaultAt);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const transitions = shipment.allowedTransitions ?? [];

  async function submit() {
    const local: Record<string, string> = {};
    if (mode === "status" && !status) local.status = "Choose the new status.";
    if (status === "EXCEPTION" && !description.trim()) {
      local.description = "Describe the exception (delay, damage, hold…).";
    }
    if (mode === "note" && !location.trim() && !description.trim()) {
      local.description = "Enter a location or a note.";
    }
    const at = occurredAt ? new Date(occurredAt) : null;
    if (!at || Number.isNaN(at.getTime())) {
      local.occurredAt = "Enter when this happened.";
    } else if (at.getTime() > Date.now()) {
      local.occurredAt = "This cannot be in the future.";
    }
    setErrors(local);
    if (Object.keys(local).length || !at) return;
    try {
      await add.mutateAsync({
        id: shipment.id,
        body: {
          status: mode === "status" && status ? status : undefined,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          // Untouched default lets the server stamp its own "now".
          occurredAt: occurredAt === defaultAt ? undefined : at.toISOString(),
        },
      });
      toast.success(
        mode === "status"
          ? `Status updated to ${importLabel(status)}`
          : "Tracking note added",
      );
      onDone();
    } catch (error) {
      const e = parseImportError(error);
      setErrors(fieldErrors(e));
      toast.error(e.message);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "status" ? "Update status" : "Add tracking note"} ·{" "}
          {shipment.referenceNumber}
        </DialogTitle>
        <DialogDescription>
          {mode === "status"
            ? `Currently ${importLabel(shipment.status).toLowerCase()}. The buyer is notified of status changes.`
            : "Record a location or progress note without changing the status."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        {mode === "status" ? (
          <Field label="New status" required error={errors.status}>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ImportShipmentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {transitions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {importLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        <Field label="Location" error={errors.location} htmlFor="e-location">
          <Input
            id="e-location"
            maxLength={160}
            placeholder="e.g. Jebel Ali port, ICD Tughlakabad"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>
        <Field
          label={status === "EXCEPTION" ? "What went wrong" : "Description"}
          required={status === "EXCEPTION"}
          error={errors.description}
          htmlFor="e-description"
        >
          <Textarea
            id="e-description"
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field
          label="When"
          required
          error={errors.occurredAt}
          htmlFor="e-occurred"
        >
          <Input
            id="e-occurred"
            type="datetime-local"
            max={toLocalDateTimeInput(new Date())}
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
        </Field>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={add.isPending}>
          Cancel
        </Button>
        <Button onClick={() => void submit()} disabled={add.isPending}>
          {add.isPending ? <Loader2 className="animate-spin" /> : null}
          {mode === "status" ? "Update status" : "Add note"}
        </Button>
      </DialogFooter>
    </>
  );
}

// Shipment card -------------------------------------------------------------------

function eventTitle(e: ImportShipmentEvent, first: boolean): string {
  if (e.previousStatus && e.previousStatus !== e.status) {
    return `${importLabel(e.previousStatus)} → ${importLabel(e.status)}`;
  }
  return first ? importLabel(e.status) : "Tracking note";
}

function ShipmentTimeline({ shipment }: { shipment: ImportShipment }) {
  if (!shipment.events.length) return null;
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">Tracking timeline</p>
      <ol className="relative space-y-4 border-l border-slate-200 pl-5">
        {shipment.events.map((e, i) => {
          const note = !e.previousStatus && i > 0;
          return (
            <li key={e.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white",
                  e.status === "EXCEPTION" && !note
                    ? "bg-red-500"
                    : e.status === "DELIVERED"
                      ? "bg-emerald-500"
                      : e.status === "CANCELLED"
                        ? "bg-slate-400"
                        : note
                          ? "bg-slate-300"
                          : "bg-primary",
                )}
              />
              <p className="text-sm font-semibold">{eventTitle(e, i === 0)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(e.occurredAt)} ·{" "}
                {e.actorParty === shipment.myParty
                  ? "You"
                  : importLabel(e.actorParty)}
              </p>
              {e.location ? (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-700">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {e.location}
                </p>
              ) : null}
              {e.description ? (
                <p className="mt-1.5 whitespace-pre-line rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {e.description}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type ShipmentAction = "status" | "note" | "edit";

function ShipmentCard({
  shipment: s,
  canManage,
}: {
  shipment: ImportShipment;
  canManage: boolean;
}) {
  const [action, setAction] = useState<ShipmentAction | null>(null);
  const manageable =
    canManage && s.canManage && !TERMINAL_STATUSES.includes(s.status);
  const close = () => setAction(null);

  return (
    <div className="space-y-4 rounded-2xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{s.referenceNumber}</p>
          <p className="text-xs text-muted-foreground">
            Booked {formatDateTime(s.createdAt)} · Updated{" "}
            {formatDateTime(s.updatedAt)}
          </p>
        </div>
        <ImportStatusBadge status={s.status} />
      </div>

      {s.status === "EXCEPTION" ? (
        <div
          role="alert"
          className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Shipment exception</p>
            <p>
              {s.exceptionReason ??
                "An exception was reported on this shipment."}
            </p>
          </div>
        </div>
      ) : null}

      <KeyValueGrid
        items={[
          { label: "Mode", value: importLabel(s.mode) },
          { label: "Quantity", value: formatQty(s.quantity, s.quantityUnit) },
          { label: "Carrier", value: s.carrierName },
          {
            label: "Tracking no. (B/L / AWB / LR)",
            value: s.trackingNumber ? (
              <span className="font-mono">{s.trackingNumber}</span>
            ) : null,
          },
          {
            label: "Vessel / voyage",
            value: [s.vesselName, s.voyageNumber].filter(Boolean).join(" · "),
          },
          {
            label: "Route",
            value: `${s.originLocation ?? "—"} → ${s.destinationLocation ?? "—"}`,
          },
          { label: "ETD", value: shipDate(s.etd) },
          {
            label: "ETA",
            value: s.eta ? (
              shipDate(s.eta)
            ) : (
              <span className="text-muted-foreground">
                ETA not available yet
              </span>
            ),
          },
          {
            label: "Containers",
            value: s.containerNumbers.length ? (
              <span className="font-mono">{s.containerNumbers.join(", ")}</span>
            ) : null,
          },
          ...(s.remarks
            ? [{ label: "Remarks", value: s.remarks, wide: true }]
            : []),
        ]}
      />

      <ShipmentTimeline shipment={s} />

      {manageable ? (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          {s.allowedTransitions?.length ? (
            <Button size="sm" onClick={() => setAction("status")}>
              <RefreshCw /> Update status
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => setAction("note")}>
            <ListPlus /> Add tracking note
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAction("edit")}>
            <Pencil /> Edit details
          </Button>
        </div>
      ) : null}

      <Dialog open={action !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent
          className={cn(
            "max-h-[90dvh] overflow-y-auto",
            action === "edit" ? "sm:max-w-2xl" : "sm:max-w-lg",
          )}
        >
          {action === "edit" ? (
            <ShipmentEditForm shipment={s} onDone={close} />
          ) : action ? (
            <ShipmentEventForm shipment={s} mode={action} onDone={close} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Deal detail section ---------------------------------------------------------------

export function ImportDealShipments({
  deal,
  canManage,
}: {
  deal: ImportDealDetail;
  canManage: boolean;
}) {
  const [bookOpen, setBookOpen] = useState(false);
  const shipments = deal.shipments ?? [];
  const dealQty = qtyToMilli(deal.quantity);
  const booked = shipments
    .filter((s) => s.status !== "CANCELLED")
    .reduce((sum, s) => sum + qtyToMilli(s.quantity), BigInt(0));
  const remaining = dealQty > booked ? dealQty - booked : BigInt(0);
  const isSeller = deal.myParty === IMPORT_OWN_PARTY;
  const shippable = SHIPPABLE_DEAL_STATUSES.includes(deal.status);
  const canBook = canManage && isSeller && shippable && remaining > BigInt(0);

  const summary = [
    { label: "Deal quantity", value: deal.quantity },
    { label: "Booked / shipped", value: milliToQty(booked) },
    { label: "Remaining to ship", value: milliToQty(remaining) },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-3">
        <div className="max-w-2xl">
          <CardTitle className="text-base">Shipments</CardTitle>
          {isSeller ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Book each consignment against this deal and keep its status
              current. Enter the carrier and tracking details your logistics
              partner gives you (B/L, AWB or LR number, vessel, containers) — no
              carrier account or credentials are needed. The buyer sees every
              update.
            </p>
          ) : null}
        </div>
        {canBook ? (
          <Button size="sm" onClick={() => setBookOpen(true)}>
            <PlusCircle /> Book shipment
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-xl border px-4 py-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-lg font-semibold">
                {formatQty(item.value, deal.quantityUnit)}
              </p>
            </div>
          ))}
        </div>
        {!shipments.length ? (
          <p className="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
            {shippable
              ? "No shipments booked yet."
              : deal.status === "PENDING_CONFIRMATION"
                ? "Shipments can be booked once both parties confirm the deal."
                : "No shipments were booked on this deal."}
          </p>
        ) : (
          shipments.map((s) => (
            <ShipmentCard key={s.id} shipment={s} canManage={canManage} />
          ))
        )}
      </CardContent>

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          {/* Mounted per open: fresh Idempotency-Key and remaining quantity. */}
          {bookOpen ? (
            <BookShipmentForm
              deal={deal}
              remaining={remaining}
              onDone={() => setBookOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Shipments list --------------------------------------------------------------------

export function ImportShipmentsPage({
  initialStatus,
}: {
  initialStatus?: string;
}) {
  const [status, setStatus] = useState<ImportShipmentStatus | undefined>(
    SHIPMENT_STATUSES.find((s) => s === initialStatus),
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 300);
  const as = IMPORT_OWN_PARTY === "BUYER" ? "buyer" : "seller";
  const list = useImportShipments({
    status,
    search: debounced || undefined,
    as,
    page,
    limit: 20,
  });

  return (
    <ImportPage
      title="Shipments"
      description="Every shipment booked against your confirmed import deals, newest activity first."
      breadcrumbs={[{ label: "Shipments" }]}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reference, tracking no., carrier or vessel"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status ?? "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? undefined : (v as ImportShipmentStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="md:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SHIPMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {importLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {list.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[92px] rounded-2xl" />
          ))}
        </div>
      ) : list.isError ? (
        <ErrorPanel
          message={parseImportError(list.error).message}
          onRetry={() => void list.refetch()}
        />
      ) : !list.data?.items.length ? (
        <p className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          {status || debounced
            ? "No shipments match these filters."
            : "No shipments yet. Book one from a confirmed deal to start tracking it here."}
        </p>
      ) : (
        <div className="space-y-2">
          {list.data.items.map((s) => (
            <Link
              key={s.id}
              href={IMPORT_ROUTES.dealDetail(s.deal.id)}
              className="block rounded-2xl border bg-card px-4 py-3.5 shadow-card hover:border-primary/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {s.referenceNumber} · Deal {s.deal.referenceNumber}
                  </p>
                  <p className="truncate font-semibold">
                    {s.deal.product ?? "—"}
                  </p>
                </div>
                <ImportStatusBadge status={s.status} />
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                {[
                  formatQty(s.quantity, s.quantityUnit),
                  importLabel(s.mode),
                  s.carrierName,
                  s.trackingNumber,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.originLocation ?? "—"} → {s.destinationLocation ?? "—"} ·{" "}
                {etaLabel(s.eta)} · Updated {formatDateTime(s.updatedAt)}
              </p>
            </Link>
          ))}
          <Pager
            page={list.data.meta.page}
            totalPages={list.data.meta.totalPages}
            total={list.data.meta.total}
            onPage={setPage}
          />
        </div>
      )}
    </ImportPage>
  );
}
