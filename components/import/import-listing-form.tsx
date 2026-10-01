"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CloudOff,
  Loader2,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useImportMaster,
  useImportPaymentTerms,
  useInvalidateImport,
} from "@/hooks/use-import";
import { IMPORT_ROUTES } from "@/lib/import/config";
import {
  DECIMAL_PRICE,
  DECIMAL_QTY,
  formatDate,
  formatDateTime,
  type ImportFieldError,
  importLabel,
  newIdempotencyKey,
  parseImportError,
  portLabel,
} from "@/lib/import/format";
import { cn } from "@/lib/utils";
import {
  createListing,
  fetchImportBrands,
  fetchImportGrades,
  fetchImportPorts,
  fetchImportProducts,
  publishListing,
  updateListing,
} from "@/services/import";
import type {
  ImportListing,
  ImportListingInput,
  ImportMasterBundle,
  ImportSide,
} from "@/types/import";

import { ImportDocumentsCard } from "./import-documents-card";
import { Field, SearchSelect, type SelectOption } from "./import-ui";

type Values = Required<Pick<ImportListingInput, "documentRequirementIds">> &
  Omit<ImportListingInput, "documentRequirementIds">;

type StepId = "product" | "commercial" | "shipping" | "quality" | "review";

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "product", title: "Product" },
  { id: "commercial", title: "Commercial" },
  { id: "shipping", title: "Shipping" },
  { id: "quality", title: "Quality & documents" },
  { id: "review", title: "Validity & review" },
];

const FIELD_STEP: Record<string, StepId> = {
  categoryId: "product",
  gradeId: "product",
  customGradeName: "product",
  brandId: "product",
  originCountryId: "product",
  quantity: "product",
  quantityUnit: "product",
  packagingId: "product",
  application: "product",
  hsCode: "product",
  casNumber: "product",
  acceptableQuantityMin: "product",
  acceptableQuantityMax: "product",
  requiredDeliveryDate: "product",
  specialRequirements: "product",
  moq: "product",
  maximumQuantity: "product",
  readyStockType: "product",
  price: "commercial",
  currencyId: "commercial",
  priceUnit: "commercial",
  priceType: "commercial",
  incotermId: "commercial",
  priceBasisPortId: "commercial",
  priceBasisLocation: "commercial",
  paymentTermId: "commercial",
  gstTreatment: "commercial",
  polId: "shipping",
  podId: "shipping",
  esd: "shipping",
  lsd: "shipping",
  transitMinDays: "shipping",
  transitMaxDays: "shipping",
  partialShipment: "shipping",
  transshipment: "shipping",
  shipmentType: "shipping",
  containerSize: "shipping",
  containerCount: "shipping",
  specification: "quality",
  inspectionType: "quality",
  documentRequirementIds: "quality",
  remarks: "quality",
  validUntil: "review",
  validFrom: "review",
};

/** Fields frozen once published (mirrors the backend LOCKED_AFTER_PUBLISH). */
const LOCKED_AFTER_PUBLISH = new Set([
  "categoryId",
  "gradeId",
  "customGradeName",
  "brandId",
  "originCountryId",
  "currencyId",
  "incotermId",
  "polId",
  "podId",
  "quantityUnit",
  "priceUnit",
]);

const DECIMAL_FIELDS: Record<string, RegExp> = {
  quantity: DECIMAL_QTY,
  acceptableQuantityMin: DECIMAL_QTY,
  acceptableQuantityMax: DECIMAL_QTY,
  moq: DECIMAL_QTY,
  maximumQuantity: DECIMAL_QTY,
  price: DECIMAL_PRICE,
};

function toValues(l?: ImportListing | null): Values {
  return {
    categoryId: l?.product.categoryId ?? null,
    gradeId: l?.product.gradeId ?? null,
    customGradeName: l?.product.customGradeName ?? null,
    brandId: l?.product.brandId ?? null,
    originCountryId: l?.product.originCountryId ?? null,
    quantity: l?.product.quantity ?? null,
    quantityUnit: l?.product.quantityUnit ?? "MT",
    packagingId: l?.product.packagingId ?? null,
    application: l?.product.application ?? null,
    hsCode: l?.product.hsCode ?? null,
    casNumber: l?.product.casNumber ?? null,
    price: l?.commercial.price ?? null,
    currencyId: l?.commercial.currencyId ?? null,
    priceUnit: l?.commercial.priceUnit ?? "MT",
    priceType: l?.commercial.priceType ?? null,
    incotermId: l?.commercial.incotermId ?? null,
    priceBasisPortId: l?.commercial.priceBasisPortId ?? null,
    priceBasisLocation: l?.commercial.priceBasisLocation ?? null,
    paymentTermId: l?.commercial.paymentTermId ?? null,
    gstTreatment: l?.commercial.gstTreatment ?? null,
    polId: l?.shipping.polId ?? null,
    podId: l?.shipping.podId ?? null,
    esd: l?.shipping.esd ?? null,
    lsd: l?.shipping.lsd ?? null,
    transitMinDays: l?.shipping.transitMinDays ?? null,
    transitMaxDays: l?.shipping.transitMaxDays ?? null,
    partialShipment: l?.shipping.partialShipment ?? null,
    transshipment: l?.shipping.transshipment ?? null,
    shipmentType: l?.shipping.shipmentType ?? null,
    containerSize: l?.shipping.containerSize ?? null,
    containerCount: l?.shipping.containerCount ?? null,
    specification: l?.quality.specification ?? null,
    inspectionType: l?.quality.inspectionType ?? null,
    documentRequirementIds: l?.quality.documentRequirementIds ?? [],
    acceptableQuantityMin: l?.buyTerms?.acceptableQuantityMin ?? null,
    acceptableQuantityMax: l?.buyTerms?.acceptableQuantityMax ?? null,
    requiredDeliveryDate: l?.buyTerms?.requiredDeliveryDate ?? null,
    specialRequirements: l?.buyTerms?.specialRequirements ?? null,
    moq: l?.sellTerms?.moq ?? null,
    maximumQuantity: l?.sellTerms?.maximumQuantity ?? null,
    readyStockType: l?.sellTerms?.readyStockType ?? null,
    remarks: l?.remarks ?? null,
    validUntil: l?.validity.validUntil ?? null,
  };
}

function labelsFrom(l?: ImportListing | null): Record<string, string> {
  if (!l) return {};
  const out: Record<string, string> = {};
  if (l.product.category) out.categoryId = l.product.category.name;
  if (l.product.grade) out.gradeId = l.product.grade.name;
  if (l.product.brand) out.brandId = l.product.brand.name;
  if (l.shipping.pol) out.polId = portLabel(l.shipping.pol);
  if (l.shipping.pod) out.podId = portLabel(l.shipping.pod);
  if (l.commercial.priceBasisPort)
    out.priceBasisPortId = portLabel(l.commercial.priceBasisPort);
  return out;
}

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Only well-formed values are sent; malformed decimals wait for the user. */
function diff(from: Values, to: Values): ImportListingInput {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(to) as Array<keyof Values>) {
    const next = to[key];
    if (same(from[key], next)) continue;
    const pattern = DECIMAL_FIELDS[key];
    if (
      pattern &&
      typeof next === "string" &&
      next !== "" &&
      !pattern.test(next)
    )
      continue;
    out[key] = next === "" ? null : next;
  }
  return out as ImportListingInput;
}

function localDecimalError(key: string, value: unknown): string | undefined {
  const pattern = DECIMAL_FIELDS[key];
  if (!pattern || typeof value !== "string" || value === "") return undefined;
  if (pattern.test(value)) return undefined;
  return key === "price"
    ? "Enter a number with up to 4 decimal places."
    : "Enter a number with up to 3 decimal places.";
}

/** `<input type="datetime-local">` value in the user's zone ↔ ISO instant. */
function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

/** New drafts start from the Admin-configured default import currency. */
function initialValues(
  initial: ImportListing | null | undefined,
  bundle: ImportMasterBundle,
): Values {
  const values = toValues(initial);
  if (initial || values.currencyId) return values;
  const def = bundle.currencies.find(
    (c) => c.code === bundle.defaultCurrencyCode,
  );
  return def ? { ...values, currencyId: def.id } : values;
}

export function ImportListingForm({
  side,
  initial,
}: {
  side: ImportSide;
  initial?: ImportListing | null;
}) {
  const master = useImportMaster();

  if (master.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading form options…
      </div>
    );
  }
  if (!master.data) {
    return (
      <p className="text-sm text-red-600">
        Import options could not be loaded. Refresh the page to try again.
      </p>
    );
  }
  return <ListingForm side={side} initial={initial} bundle={master.data} />;
}

function ListingForm({
  side,
  initial,
  bundle,
}: {
  side: ImportSide;
  initial?: ImportListing | null;
  bundle: ImportMasterBundle;
}) {
  const router = useRouter();
  const invalidate = useInvalidateImport();

  const isBuy = side === "BUY";
  const live = Boolean(initial && initial.status !== "DRAFT");

  const [listing, setListing] = useState<ImportListing | null>(initial ?? null);
  const [values, setValues] = useState<Values>(() =>
    initialValues(initial, bundle),
  );
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    labelsFrom(initial),
  );
  const [step, setStep] = useState<StepId>("product");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishing, setPublishing] = useState(false);

  const savedRef = useRef<Values>(initialValues(initial, bundle));
  const versionRef = useRef<number>(initial?.version ?? 0);
  const idRef = useRef<string | null>(initial?.id ?? null);
  const savingRef = useRef<Promise<boolean> | null>(null);
  const publishKeyRef = useRef<string | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const currency = bundle.currencies.find((c) => c.id === values.currencyId);
  const currencyCode = currency?.code ?? null;
  const incoterm = bundle.incoterms.find((i) => i.id === values.incotermId);
  const terms = useImportPaymentTerms(currencyCode);

  const set = useCallback(
    <K extends keyof Values>(key: K, value: Values[K], label?: string) => {
      if (live && LOCKED_AFTER_PUBLISH.has(key as string)) return;
      setValues((v) => {
        const next = { ...v, [key]: value };
        if (key === "categoryId" && value !== v.categoryId) {
          next.gradeId = null;
        }
        // Payment terms depend on currency; GST applies to INR only.
        if (key === "currencyId" && value !== v.currencyId) {
          next.paymentTermId = null;
          const code = bundle.currencies.find((c) => c.id === value)?.code;
          if (code !== "INR") next.gstTreatment = null;
        }
        return next;
      });
      if (label !== undefined) setLabels((l) => ({ ...l, [key]: label }));
      setFieldErrors((e) => {
        if (!e[key as string]) return e;
        const rest = { ...e };
        delete rest[key as string];
        return rest;
      });
    },
    [live, bundle],
  );

  const pending = useMemo(() => diff(savedRef.current, values), [values]);
  const hasPending = Object.keys(pending).length > 0;

  /** Persists pending changes as a backend draft. Resolves false on failure. */
  const save = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) {
      await savingRef.current;
    }
    const current = valuesRef.current;
    const changes = diff(savedRef.current, current);
    if (!Object.keys(changes).length) return true;

    const run = (async () => {
      setSaveState("saving");
      try {
        let result: ImportListing;
        if (!idRef.current) {
          result = await createListing(side, {
            ...diff(toValues(null), savedRef.current),
            ...changes,
          });
          idRef.current = result.id;
          window.history.replaceState(null, "", IMPORT_ROUTES.edit(result.id));
        } else {
          result = await updateListing(side, idRef.current, {
            ...changes,
            version: versionRef.current,
          });
        }
        versionRef.current = result.version;
        savedRef.current = {
          ...savedRef.current,
          ...(changes as Partial<Values>),
        };
        setListing(result);
        setSavedAt(new Date());
        setSaveState(
          same(diff(savedRef.current, valuesRef.current), {})
            ? "saved"
            : "dirty",
        );
        return true;
      } catch (error) {
        const e = parseImportError(error);
        if (e.code === "IMPORT_DRAFT_CONFLICT") {
          setSaveState("conflict");
        } else {
          setSaveState("error");
          applyErrors(e.fields);
          if (!e.fields.length) toast.error(e.message);
        }
        return false;
      }
    })();
    savingRef.current = run;
    try {
      return await run;
    } finally {
      savingRef.current = null;
    }
  }, [side]);

  function applyErrors(errors: ImportFieldError[]) {
    if (!errors.length) return;
    setFieldErrors(Object.fromEntries(errors.map((e) => [e.field, e.message])));
  }

  // Drafts autosave after each edit; a failed save waits for the next edit.
  // Live listings save explicitly so counterparties are not notified on every
  // keystroke.
  const conflictRef = useRef(false);
  conflictRef.current = saveState === "conflict";
  useEffect(() => {
    if (live || conflictRef.current) return;
    if (!Object.keys(diff(savedRef.current, values)).length) return;
    setSaveState((s) => (s === "saving" ? s : "dirty"));
    const timer = window.setTimeout(() => void save(), 1200);
    return () => window.clearTimeout(timer);
  }, [values, live, save]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!hasPending) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasPending]);

  async function handleSaveLive() {
    const ok = await save();
    if (ok) {
      toast.success("Changes saved");
      invalidate();
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const ok = await save();
      if (!ok || !idRef.current) return;
      publishKeyRef.current ??= newIdempotencyKey();
      const result = await publishListing(
        side,
        idRef.current,
        publishKeyRef.current,
      );
      publishKeyRef.current = null;
      toast.success(`${result.referenceNumber ?? "Listing"} published`);
      invalidate();
      router.push(IMPORT_ROUTES.mineDetail(result.id));
    } catch (error) {
      const e = parseImportError(error);
      if (e.status !== null) publishKeyRef.current = null;
      if (e.fields.length) {
        applyErrors(e.fields);
        const firstField = e.fields[0]?.field;
        const first = firstField ? FIELD_STEP[firstField] : undefined;
        if (first) setStep(first);
        toast.error(
          `Please fix ${e.fields.length} field${e.fields.length > 1 ? "s" : ""} before publishing.`,
        );
      } else {
        toast.error(e.message);
      }
    } finally {
      setPublishing(false);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const goToStep = (index: number) => {
    const target = STEPS[index];
    if (target) setStep(target.id);
  };
  const stepErrors = useMemo(() => {
    const counts: Partial<Record<StepId, number>> = {};
    for (const key of Object.keys(fieldErrors)) {
      const s = FIELD_STEP[key];
      if (s) counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [fieldErrors]);

  const err = (key: string) =>
    fieldErrors[key] ?? localDecimalError(key, values[key as keyof Values]);
  const locked = (key: string) => live && LOCKED_AFTER_PUBLISH.has(key);

  const enumSelect = (
    key: keyof Values,
    options: string[],
    placeholder = "Select",
  ) => (
    <Select
      value={(values[key] as string | null) ?? ""}
      onValueChange={(v) => set(key, (v || null) as Values[typeof key])}
      disabled={locked(key as string)}
    >
      <SelectTrigger className={cn(err(key as string) && "border-red-400")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {importLabel(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const textInput = (
    key: keyof Values,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Input
      id={`f-${key}`}
      value={(values[key] as string | number | null) ?? ""}
      onChange={(e) => set(key, e.target.value as Values[typeof key])}
      disabled={locked(key as string)}
      className={cn(err(key as string) && "border-red-400")}
      {...props}
    />
  );

  const numberInput = (
    key: "transitMinDays" | "transitMaxDays" | "containerCount",
  ) => (
    <Input
      id={`f-${key}`}
      type="number"
      min={key === "containerCount" ? 1 : 0}
      value={values[key] ?? ""}
      onChange={(e) =>
        set(
          key,
          e.target.value === "" ? null : Math.trunc(Number(e.target.value)),
        )
      }
      className={cn(err(key) && "border-red-400")}
    />
  );

  const portSelect = (key: "polId" | "podId" | "priceBasisPortId") => (
    <SearchSelect
      id={`f-${key}`}
      value={values[key]}
      selectedLabel={labels[key]}
      onChange={(v, o) => set(key, v, o?.label ?? "")}
      load={async (search) =>
        (await fetchImportPorts(search || undefined)).map((p) => ({
          value: p.id,
          label: portLabel(p),
          hint: p.countryCode,
        }))
      }
      queryKey={["import", "ports"]}
      placeholder="Search port or UN/LOCODE"
      disabled={locked(key)}
      invalid={Boolean(err(key))}
    />
  );

  const qtyUnit = importLabel(values.quantityUnit ?? "MT");

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Step rail */}
      <aside className="space-y-3">
        <ol className="flex gap-2 overflow-x-auto lg:flex-col">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const errors = stepErrors[s.id];
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/5 font-semibold text-primary"
                      : "border-transparent text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                      errors
                        ? "bg-red-100 text-red-700"
                        : i < stepIndex
                          ? "bg-emerald-100 text-emerald-700"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {errors ? (
                      "!"
                    ) : i < stepIndex ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
        <SaveIndicator
          live={live}
          state={saveState}
          savedAt={savedAt}
          hasPending={hasPending}
          referenceNumber={listing?.referenceNumber ?? null}
        />
      </aside>

      <div className="min-w-0 space-y-5">
        {saveState === "conflict" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                This draft was changed in another window.
              </p>
              <p className="mt-0.5">
                Reload to get the latest version before editing again. Your
                unsaved edits here will be discarded.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            </div>
          </div>
        ) : null}
        {live ? (
          <div className="flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              This listing is live. Product, origin, currency, Incoterm, ports
              and units are locked. Counterparties in active negotiations are
              notified when price, shipment dates or payment terms change.
            </p>
          </div>
        ) : null}

        {step === "product" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Product / material"
                required
                error={err("categoryId")}
                htmlFor="f-categoryId"
              >
                <SearchSelect
                  id="f-categoryId"
                  value={values.categoryId}
                  selectedLabel={labels.categoryId}
                  onChange={(v, o) => set("categoryId", v, o?.label ?? "")}
                  load={async (search) =>
                    (await fetchImportProducts(search || undefined)).map(
                      (p) => ({
                        value: p.id,
                        label: p.displayName ?? p.name,
                        hint: p.parentGroup ?? undefined,
                      }),
                    )
                  }
                  queryKey={["import", "products"]}
                  placeholder="Search product (e.g. PP, HDPE)"
                  disabled={locked("categoryId")}
                  invalid={Boolean(err("categoryId"))}
                />
              </Field>
              <Field
                label="Grade"
                required
                error={err("gradeId")}
                hint={
                  bundle.allowCustomGrade
                    ? "Can't find it? Enter a custom grade name below."
                    : undefined
                }
                htmlFor="f-gradeId"
              >
                <SearchSelect
                  id="f-gradeId"
                  value={values.gradeId}
                  selectedLabel={labels.gradeId}
                  onChange={(v, o) => set("gradeId", v, o?.label ?? "")}
                  load={async (search) =>
                    (
                      await fetchImportGrades(
                        values.categoryId ?? undefined,
                        search || undefined,
                      )
                    ).map((g) => ({
                      value: g.id,
                      label: g.displayName ?? g.name,
                      hint: g.code,
                    }))
                  }
                  queryKey={["import", "grades", values.categoryId]}
                  placeholder={
                    values.categoryId
                      ? "Search grade"
                      : "Select a product first"
                  }
                  disabled={!values.categoryId || locked("gradeId")}
                  invalid={Boolean(err("gradeId"))}
                />
              </Field>
              {bundle.allowCustomGrade && !values.gradeId ? (
                <Field
                  label="Custom grade name"
                  error={err("customGradeName")}
                  htmlFor="f-customGradeName"
                >
                  {textInput("customGradeName", {
                    placeholder: "Grade as quoted by the manufacturer",
                    maxLength: 120,
                  })}
                </Field>
              ) : null}
              <Field
                label="Brand / manufacturer"
                required
                error={err("brandId")}
                htmlFor="f-brandId"
              >
                <SearchSelect
                  id="f-brandId"
                  value={values.brandId}
                  selectedLabel={labels.brandId}
                  onChange={(v, o) => set("brandId", v, o?.label ?? "")}
                  load={async (search) =>
                    (await fetchImportBrands(search || undefined)).map((b) => ({
                      value: b.id,
                      label: b.name,
                      hint: b.country?.code,
                    }))
                  }
                  queryKey={["import", "brands"]}
                  placeholder="Search brand"
                  disabled={locked("brandId")}
                  invalid={Boolean(err("brandId"))}
                />
              </Field>
              <Field
                label="Country of origin"
                required
                error={err("originCountryId")}
                htmlFor="f-originCountryId"
              >
                <SearchSelect
                  id="f-originCountryId"
                  value={values.originCountryId}
                  onChange={(v) => set("originCountryId", v)}
                  options={bundle.countries.map<SelectOption>((c) => ({
                    value: c.id,
                    label: c.name,
                    hint: c.code,
                  }))}
                  placeholder="Select country"
                  disabled={locked("originCountryId")}
                  invalid={Boolean(err("originCountryId"))}
                />
              </Field>
              <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)]">
                <Field
                  label={isBuy ? "Required quantity" : "Available quantity"}
                  required
                  error={err("quantity")}
                  htmlFor="f-quantity"
                >
                  {textInput("quantity", {
                    inputMode: "decimal",
                    placeholder: "e.g. 500",
                  })}
                </Field>
                <Field label="Unit" required error={err("quantityUnit")}>
                  {enumSelect("quantityUnit", bundle.enums.quantityUnits)}
                </Field>
                <Field
                  label="Packaging"
                  error={err("packagingId")}
                  className="col-span-2 sm:col-span-1"
                >
                  <Select
                    value={values.packagingId ?? ""}
                    onValueChange={(v) => set("packagingId", v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      {bundle.packaging.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {isBuy ? (
                <>
                  <Field
                    label={`Minimum acceptable quantity (${qtyUnit})`}
                    error={err("acceptableQuantityMin")}
                    hint="Optional — lets smaller offers match."
                    htmlFor="f-acceptableQuantityMin"
                  >
                    {textInput("acceptableQuantityMin", {
                      inputMode: "decimal",
                    })}
                  </Field>
                  <Field
                    label={`Maximum acceptable quantity (${qtyUnit})`}
                    error={err("acceptableQuantityMax")}
                    htmlFor="f-acceptableQuantityMax"
                  >
                    {textInput("acceptableQuantityMax", {
                      inputMode: "decimal",
                    })}
                  </Field>
                  <Field
                    label="Required delivery date"
                    error={err("requiredDeliveryDate")}
                    htmlFor="f-requiredDeliveryDate"
                  >
                    {textInput("requiredDeliveryDate", { type: "date" })}
                  </Field>
                </>
              ) : (
                <>
                  <Field
                    label={`Minimum order quantity (${qtyUnit})`}
                    required
                    error={err("moq")}
                    htmlFor="f-moq"
                  >
                    {textInput("moq", { inputMode: "decimal" })}
                  </Field>
                  <Field
                    label={`Maximum per buyer (${qtyUnit})`}
                    error={err("maximumQuantity")}
                    htmlFor="f-maximumQuantity"
                  >
                    {textInput("maximumQuantity", { inputMode: "decimal" })}
                  </Field>
                  <Field
                    label="Stock type"
                    required
                    error={err("readyStockType")}
                  >
                    {enumSelect("readyStockType", bundle.enums.readyStockTypes)}
                  </Field>
                </>
              )}

              <Field
                label="Application"
                error={err("application")}
                htmlFor="f-application"
              >
                {textInput("application", {
                  placeholder: "e.g. Injection moulding",
                  maxLength: 300,
                })}
              </Field>
              <Field label="HS code" error={err("hsCode")} htmlFor="f-hsCode">
                {textInput("hsCode", {
                  placeholder: "e.g. 39021000",
                  maxLength: 20,
                })}
              </Field>
              <Field
                label="CAS number"
                error={err("casNumber")}
                htmlFor="f-casNumber"
              >
                {textInput("casNumber", {
                  placeholder: "e.g. 9003-07-0",
                  maxLength: 20,
                })}
              </Field>
              {isBuy ? (
                <Field
                  label="Special requirements"
                  error={err("specialRequirements")}
                  className="sm:col-span-2"
                  htmlFor="f-specialRequirements"
                >
                  <Textarea
                    id="f-specialRequirements"
                    rows={3}
                    maxLength={3000}
                    value={values.specialRequirements ?? ""}
                    onChange={(e) => set("specialRequirements", e.target.value)}
                  />
                </Field>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {step === "commercial" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Commercial terms</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field label="Currency" required error={err("currencyId")}>
                <Select
                  value={values.currencyId ?? ""}
                  onValueChange={(v) => set("currencyId", v || null)}
                  disabled={locked("currencyId")}
                >
                  <SelectTrigger
                    className={cn(err("currencyId") && "border-red-400")}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {bundle.currencies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Price type" required error={err("priceType")}>
                {enumSelect("priceType", bundle.enums.priceTypes)}
              </Field>
              <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3 sm:col-span-2">
                <Field
                  label={`${isBuy ? "Target price" : "Offer price"}${currencyCode ? ` (${currencyCode})` : ""}`}
                  required
                  error={err("price")}
                  htmlFor="f-price"
                >
                  {textInput("price", {
                    inputMode: "decimal",
                    placeholder: "e.g. 1050.00",
                  })}
                </Field>
                <Field label="Per" required error={err("priceUnit")}>
                  {enumSelect("priceUnit", bundle.enums.quantityUnits)}
                </Field>
              </div>
              <Field label="Incoterm" required error={err("incotermId")}>
                <Select
                  value={values.incotermId ?? ""}
                  onValueChange={(v) => {
                    set("incotermId", v || null);
                    const basis = bundle.incoterms.find(
                      (i) => i.id === v,
                    )?.priceBasis;
                    const port =
                      basis === "ORIGIN"
                        ? "polId"
                        : basis === "DESTINATION"
                          ? "podId"
                          : null;
                    if (port && values[port] && !values.priceBasisPortId) {
                      set("priceBasisPortId", values[port], labels[port]);
                    }
                  }}
                  disabled={locked("incotermId")}
                >
                  <SelectTrigger
                    className={cn(err("incotermId") && "border-red-400")}
                  >
                    <SelectValue placeholder="Select Incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    {bundle.incoterms.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.code} — {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Price basis port"
                required
                error={err("priceBasisPortId")}
                hint={
                  incoterm?.priceBasis === "ORIGIN"
                    ? "For this Incoterm the price usually refers to the port of loading."
                    : incoterm?.priceBasis === "DESTINATION"
                      ? "For this Incoterm the price usually refers to the port of discharge."
                      : "Prices are only compared when Incoterm and basis location match."
                }
              >
                {portSelect("priceBasisPortId")}
              </Field>
              {!values.priceBasisPortId ? (
                <Field
                  label="Price basis location (if not a listed port)"
                  error={err("priceBasisLocation")}
                  htmlFor="f-priceBasisLocation"
                >
                  {textInput("priceBasisLocation", { maxLength: 160 })}
                </Field>
              ) : null}
              <Field
                label="Payment terms"
                required
                error={err("paymentTermId")}
                hint={
                  currencyCode
                    ? `Showing terms available for ${currencyCode}.`
                    : "Select a currency first."
                }
              >
                <Select
                  value={values.paymentTermId ?? ""}
                  onValueChange={(v) => set("paymentTermId", v || null)}
                  disabled={!currencyCode || terms.isLoading}
                >
                  <SelectTrigger
                    className={cn(err("paymentTermId") && "border-red-400")}
                  >
                    <SelectValue
                      placeholder={
                        terms.isLoading ? "Loading…" : "Select payment term"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(terms.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.displayName ?? t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {currencyCode === "INR" ? (
                <Field
                  label="GST treatment"
                  required
                  error={err("gstTreatment")}
                >
                  {enumSelect("gstTreatment", bundle.enums.gstTreatments)}
                </Field>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {step === "shipping" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Port of loading (POL)"
                required
                error={err("polId")}
              >
                {portSelect("polId")}
              </Field>
              <Field
                label="Port of discharge (POD)"
                required
                error={err("podId")}
              >
                {portSelect("podId")}
              </Field>
              <Field
                label="Earliest shipment date"
                required
                error={err("esd")}
                htmlFor="f-esd"
              >
                {textInput("esd", { type: "date" })}
              </Field>
              <Field
                label="Latest shipment date"
                required
                error={err("lsd")}
                htmlFor="f-lsd"
              >
                {textInput("lsd", {
                  type: "date",
                  min: values.esd ?? undefined,
                })}
              </Field>
              <Field
                label="Transit time — minimum days"
                error={err("transitMinDays")}
                htmlFor="f-transitMinDays"
              >
                {numberInput("transitMinDays")}
              </Field>
              <Field
                label="Transit time — maximum days"
                error={err("transitMaxDays")}
                htmlFor="f-transitMaxDays"
              >
                {numberInput("transitMaxDays")}
              </Field>
              <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-3 text-sm sm:col-span-2">
                <p className="font-medium text-slate-700">
                  Estimated arrival (ETA)
                </p>
                <p className="mt-0.5 text-slate-600">
                  {listing?.shipping.estimatedEta
                    ? `${formatDate(listing.shipping.estimatedEta.from)} – ${formatDate(listing.shipping.estimatedEta.to)}`
                    : "Add shipment dates and transit days to see an estimate."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimate only: shipment window plus transit days. Not a
                  carrier schedule.
                </p>
              </div>
              <Field label="Partial shipment" error={err("partialShipment")}>
                {enumSelect(
                  "partialShipment",
                  bundle.enums.shipmentPermissions,
                )}
              </Field>
              <Field label="Transshipment" error={err("transshipment")}>
                {enumSelect("transshipment", bundle.enums.shipmentPermissions)}
              </Field>
              <Field label="Shipment type" error={err("shipmentType")}>
                {enumSelect("shipmentType", bundle.enums.shipmentTypes)}
              </Field>
              <Field
                label="Container size"
                required={values.quantityUnit === "CONTAINER"}
                error={err("containerSize")}
              >
                {enumSelect("containerSize", bundle.enums.containerSizes)}
              </Field>
              <Field
                label="Number of containers"
                error={err("containerCount")}
                htmlFor="f-containerCount"
              >
                {numberInput("containerCount")}
              </Field>
            </CardContent>
          </Card>
        ) : null}

        {step === "quality" ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quality & documents</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Specification"
                  error={err("specification")}
                  className="sm:col-span-2"
                  htmlFor="f-specification"
                >
                  <Textarea
                    id="f-specification"
                    rows={4}
                    maxLength={5000}
                    placeholder="MFI, density, additives, moisture…"
                    value={values.specification ?? ""}
                    onChange={(e) => set("specification", e.target.value)}
                  />
                </Field>
                <Field label="Inspection" error={err("inspectionType")}>
                  {enumSelect("inspectionType", bundle.enums.inspectionTypes)}
                </Field>
                <Field
                  label={isBuy ? "Required documents" : "Documents offered"}
                  error={err("documentRequirementIds")}
                  className="sm:col-span-2"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {bundle.documentRequirements.map((d) => {
                      const checked = values.documentRequirementIds.includes(
                        d.id,
                      );
                      return (
                        <label
                          key={d.id}
                          className="flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) =>
                              set(
                                "documentRequirementIds",
                                c
                                  ? [...values.documentRequirementIds, d.id]
                                  : values.documentRequirementIds.filter(
                                      (x) => x !== d.id,
                                    ),
                              )
                            }
                          />
                          <span>
                            <span className="font-medium">{d.name}</span>
                            {d.description ? (
                              <span className="block text-xs text-muted-foreground">
                                {d.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
                <Field
                  label="Remarks"
                  error={err("remarks")}
                  className="sm:col-span-2"
                  htmlFor="f-remarks"
                >
                  <Textarea
                    id="f-remarks"
                    rows={3}
                    maxLength={3000}
                    value={values.remarks ?? ""}
                    onChange={(e) => set("remarks", e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>
            {listing ? (
              <ImportDocumentsCard listingId={listing.id} canManage />
            ) : (
              <p className="text-sm text-muted-foreground">
                Attachments (COA, TDS, certificates) can be uploaded once the
                draft has been saved.
              </p>
            )}
          </>
        ) : null}

        {step === "review" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Validity & review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field
                label="Valid until"
                required
                error={err("validUntil")}
                hint="The listing expires automatically at this time (server clock)."
                htmlFor="f-validUntil"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    id="f-validUntil"
                    type="datetime-local"
                    className={cn(
                      "max-w-[260px]",
                      err("validUntil") && "border-red-400",
                    )}
                    value={toLocalInput(values.validUntil)}
                    onChange={(e) =>
                      set(
                        "validUntil",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      )
                    }
                  />
                  {[7, 15, 30].map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        set(
                          "validUntil",
                          new Date(Date.now() + days * 86400000).toISOString(),
                        )
                      }
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
              </Field>
              <ReviewSummary
                values={values}
                labels={labels}
                bundle={bundle}
                currencyCode={currencyCode}
                termsName={
                  terms.data?.find((t) => t.id === values.paymentTermId)
                    ?.displayName ??
                  terms.data?.find((t) => t.id === values.paymentTermId)?.name
                }
                side={side}
              />
              {Object.keys(fieldErrors).length ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p className="font-medium">Fix these before publishing:</p>
                  <ul className="mt-1 list-disc pl-5">
                    {Object.entries(fieldErrors).map(([field, message]) => (
                      <li key={field}>
                        <button
                          type="button"
                          className="underline-offset-2 hover:underline"
                          onClick={() => setStep(FIELD_STEP[field] ?? "review")}
                        >
                          {message}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={stepIndex === 0}
            onClick={() => goToStep(stepIndex - 1)}
          >
            Back
          </Button>
          <div className="flex flex-wrap gap-2">
            {live ? (
              <Button
                type="button"
                onClick={handleSaveLive}
                disabled={!hasPending || saveState === "saving"}
              >
                {saveState === "saving" ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                Save changes
              </Button>
            ) : (
              <>
                {stepIndex < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    variant={step === "review" ? "outline" : "default"}
                    onClick={() => goToStep(stepIndex + 1)}
                  >
                    Next
                  </Button>
                ) : null}
                {step === "review" ? (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing || saveState === "conflict"}
                  >
                    {publishing ? <Loader2 className="animate-spin" /> : null}
                    Publish {isBuy ? "buy request" : "sell offer"}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({
  live,
  state,
  savedAt,
  hasPending,
  referenceNumber,
}: {
  live: boolean;
  state: SaveState;
  savedAt: Date | null;
  hasPending: boolean;
  referenceNumber: string | null;
}) {
  let content: React.ReactNode;
  if (state === "saving") {
    content = (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </>
    );
  } else if (state === "error") {
    content = (
      <>
        <CloudOff className="h-3.5 w-3.5 text-red-600" /> Not saved — check
        highlighted fields
      </>
    );
  } else if (hasPending) {
    content = <>{live ? "Unsaved changes" : "Unsaved changes…"}</>;
  } else if (savedAt) {
    content = (
      <>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Saved{" "}
        {formatDateTime(savedAt.toISOString())}
      </>
    );
  } else {
    content = <>{live ? "No changes" : "Draft saves automatically"}</>;
  }
  return (
    <div className="hidden rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground lg:block">
      {referenceNumber ? (
        <p className="mb-1 font-medium text-foreground">{referenceNumber}</p>
      ) : null}
      <p className="flex items-center gap-1.5">{content}</p>
    </div>
  );
}

function ReviewSummary({
  values,
  labels,
  bundle,
  currencyCode,
  termsName,
  side,
}: {
  values: Values;
  labels: Record<string, string>;
  bundle: ImportMasterBundle;
  currencyCode: string | null;
  termsName?: string | null;
  side: ImportSide;
}) {
  const country = bundle.countries.find(
    (c) => c.id === values.originCountryId,
  )?.name;
  const incoterm = bundle.incoterms.find(
    (i) => i.id === values.incotermId,
  )?.code;
  const rows: Array<[string, string | null | undefined]> = [
    ["Product", labels.categoryId],
    ["Grade", labels.gradeId ?? values.customGradeName],
    ["Brand", labels.brandId],
    ["Origin", country],
    [
      "Quantity",
      values.quantity
        ? `${values.quantity} ${importLabel(values.quantityUnit ?? "MT")}`
        : null,
    ],
    [
      side === "BUY" ? "Target price" : "Offer price",
      values.price
        ? `${currencyCode ?? ""} ${values.price} / ${importLabel(values.priceUnit ?? "MT")}`
        : null,
    ],
    [
      "Incoterm",
      incoterm
        ? `${incoterm} ${labels.priceBasisPortId ?? values.priceBasisLocation ?? ""}`
        : null,
    ],
    ["Payment terms", termsName],
    [
      "POL → POD",
      labels.polId && labels.podId ? `${labels.polId} → ${labels.podId}` : null,
    ],
    [
      "Shipment window",
      values.esd && values.lsd
        ? `${formatDate(values.esd)} – ${formatDate(values.lsd)}`
        : null,
    ],
    [
      "Valid until",
      values.validUntil ? formatDateTime(values.validUntil) : null,
    ],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-3 rounded-xl border bg-slate-50/60 p-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className={cn("mt-0.5 text-sm", !value && "text-amber-700")}>
            {value || "Not set"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
