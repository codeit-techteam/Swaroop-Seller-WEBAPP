"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import {
  type CatalogueMatch,
  clearGradeRequestIdempotencyKey,
  createGradeRequest,
  type CreateGradeRequestInput,
  fetchGradeRequestPrefill,
  getGradeRequestIdempotencyKey,
  GRADE_REQUEST_DOCUMENT_TYPES,
  GRADE_REQUEST_UNITS,
  GRADE_REQUESTS_QUERY_KEY,
  type GradeRequest,
  type GradeRequestDocumentType,
  GradeRequestError,
  gradeRequestPath,
  type GradeRequestPrefill,
  type GradeRequestUnit,
  uploadGradeRequestDocument,
} from "@/services/grade-requests";

interface FormState {
  gradeName: string;
  materialCategory: string;
  manufacturer: string;
  gradeGroup: string;
  application: string;
  technicalSpecs: string;
  quantity: string;
  unit: GradeRequestUnit;
  deliveryLocation: string;
  deliveryPincode: string;
  requiredByDate: string;
  preferredPackaging: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  remarks: string;
}

type Errors = Partial<Record<keyof FormState | "files", string>>;

interface PendingFile {
  key: string;
  file: File;
  type: GradeRequestDocumentType;
}

const EMPTY: FormState = {
  gradeName: "",
  materialCategory: "",
  manufacturer: "",
  gradeGroup: "",
  application: "",
  technicalSpecs: "",
  quantity: "",
  unit: "MT",
  deliveryLocation: "",
  deliveryPincode: "",
  requiredByDate: "",
  preferredPackaging: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  remarks: "",
};

const digitsOnly = (v: string, max: number) =>
  v.replace(/\D/g, "").slice(0, max);

const todayIso = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export function validateGradeRequestForm(f: FormState): Errors {
  const e: Errors = {};
  if (f.gradeName.trim().length < 2)
    e.gradeName = "Enter the grade name or number.";
  if (f.materialCategory.trim().length < 2)
    e.materialCategory = "Enter the material or category.";
  const qty = Number(f.quantity);
  if (!f.quantity.trim() || !Number.isFinite(qty) || qty <= 0)
    e.quantity = "Enter a quantity greater than zero.";
  else if (qty > 1_000_000) e.quantity = "Quantity is too large.";
  if (f.deliveryLocation.trim().length < 3)
    e.deliveryLocation = "Enter the warehouse / dispatch location.";
  if (f.deliveryPincode && !/^[1-9][0-9]{5}$/.test(f.deliveryPincode))
    e.deliveryPincode = "Enter a valid 6-digit pincode.";
  if (f.requiredByDate && f.requiredByDate < todayIso())
    e.requiredByDate = "Date cannot be in the past.";
  if (f.contactName.trim().length < 2) e.contactName = "Enter a contact name.";
  if (!/^(?:\+?91)?[6-9][0-9]{9}$/.test(f.contactPhone.replace(/[\s-]/g, "")))
    e.contactPhone = "Enter a valid 10-digit mobile number.";
  if (f.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail))
    e.contactEmail = "Enter a valid email address.";
  return e;
}

export function NewGradeRequestForm() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    gradeName: (params.get("q") ?? "").trim().slice(0, 120),
  });
  const [errors, setErrors] = useState<Errors>({});
  const [prefill, setPrefill] = useState<GradeRequestPrefill | null>(null);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<GradeRequestError | null>(
    null,
  );
  const [acknowledgeExisting, setAcknowledgeExisting] = useState(false);
  const [result, setResult] = useState<GradeRequest | null>(null);
  const [uploadFailures, setUploadFailures] = useState<PendingFile[]>([]);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let active = true;
    fetchGradeRequestPrefill()
      .then((data) => {
        if (!active) return;
        setPrefill(data);
        setForm((current) => ({
          ...current,
          contactName: current.contactName || data.contactName || "",
          contactPhone:
            current.contactPhone ||
            digitsOnly((data.contactPhone ?? "").replace(/^\+?91/, ""), 10),
          contactEmail: current.contactEmail || data.contactEmail || "",
          deliveryLocation:
            current.deliveryLocation || data.defaultAddress?.formatted || "",
          deliveryPincode:
            current.deliveryPincode || data.defaultAddress?.postalCode || "",
        }));
      })
      .catch((e: unknown) => {
        if (active)
          setPrefillError(
            e instanceof Error ? e.message : "Unable to load your details.",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  const limits = prefill?.limits;
  const maxFiles = limits?.maxDocuments ?? 5;
  const maxBytes = limits?.maxFileSizeBytes ?? 10 * 1024 * 1024;
  const allowedMime = useMemo(
    () =>
      limits?.allowedMimeTypes ?? [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
    [limits],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    // Any edit invalidates a previous "already in catalogue" decision.
    if (key === "gradeName" || key === "manufacturer") {
      setAcknowledgeExisting(false);
      setSubmitError((err) =>
        err?.code === "GRADE_ALREADY_IN_CATALOGUE" ? null : err,
      );
    }
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    let message: string | undefined;
    for (const file of Array.from(list)) {
      if (next.length >= maxFiles) {
        message = `You can attach up to ${maxFiles} files.`;
        break;
      }
      if (!allowedMime.includes(file.type)) {
        message = `${file.name}: only PDF, JPG, PNG or WebP files are allowed.`;
        continue;
      }
      if (file.size > maxBytes) {
        message = `${file.name} is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`;
        continue;
      }
      next.push({
        key: `${file.name}-${file.size}-${next.length}`,
        file,
        type: "TDS",
      });
    }
    setFiles(next);
    setErrors((e) => ({ ...e, files: message }));
  };

  async function uploadAll(requestId: string, pending: PendingFile[]) {
    const failed: PendingFile[] = [];
    for (const item of pending) {
      try {
        await uploadGradeRequestDocument(requestId, item.type, item.file);
      } catch {
        failed.push(item);
      }
    }
    return failed;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    const found = validateGradeRequestForm(form);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>("[data-field-error='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const body: CreateGradeRequestInput = {
      gradeName: form.gradeName.trim(),
      materialCategory: form.materialCategory.trim(),
      manufacturer: form.manufacturer.trim() || undefined,
      gradeGroup: form.gradeGroup.trim() || undefined,
      application: form.application.trim() || undefined,
      technicalSpecs: form.technicalSpecs.trim() || undefined,
      remarks: form.remarks.trim() || undefined,
      quantity: Number(form.quantity),
      unit: form.unit,
      deliveryLocation: form.deliveryLocation.trim(),
      deliveryPincode: form.deliveryPincode || undefined,
      deliveryAddressId:
        prefill?.defaultAddress &&
        form.deliveryLocation.trim() === prefill.defaultAddress.formatted
          ? prefill.defaultAddress.id
          : undefined,
      requiredByDate: form.requiredByDate || undefined,
      preferredPackaging: form.preferredPackaging.trim() || undefined,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail.trim() || undefined,
    };
    body.idempotencyKey = getGradeRequestIdempotencyKey(JSON.stringify(body));
    body.acknowledgeExisting = acknowledgeExisting || undefined;
    try {
      const created = await createGradeRequest(body);
      clearGradeRequestIdempotencyKey();
      void queryClient.invalidateQueries({
        queryKey: GRADE_REQUESTS_QUERY_KEY,
      });
      setResult(created);
      if (files.length) setUploadFailures(await uploadAll(created.id, files));
    } catch (e) {
      setSubmitError(
        e instanceof GradeRequestError
          ? e
          : new GradeRequestError("Unable to submit your request."),
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  async function retryUploads() {
    if (!result) return;
    setRetrying(true);
    setUploadFailures(await uploadAll(result.id, uploadFailures));
    setRetrying(false);
  }

  if (result) {
    return (
      <PageContainer className="max-w-2xl space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2
            className="mx-auto h-10 w-10 text-emerald-600"
            aria-hidden
          />
          <h1 className="mt-3 text-xl font-semibold text-slate-900">
            Request submitted
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Reference <strong>{result.referenceNumber}</strong>. Status:{" "}
            <strong>{result.statusLabel}</strong>. {result.statusDescription}
          </p>
        </div>

        {uploadFailures.length ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <p className="font-medium">
              {uploadFailures.length} file{uploadFailures.length > 1 ? "s" : ""}{" "}
              could not be attached.
            </p>
            <p className="mt-0.5">
              Your request is saved. You can retry now, or attach files later
              from the request page.
            </p>
            <ul className="mt-2 list-disc pl-5">
              {uploadFailures.map((f) => (
                <li key={f.key}>{f.file.name}</li>
              ))}
            </ul>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => void retryUploads()}
              disabled={retrying}
            >
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              Retry upload
            </Button>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">What happens next</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Our team reviews the technical details.</li>
            <li>We may ask you for more information — you will be notified.</li>
            <li>
              Once the grade is added to the catalogue, you can list or offer it
              from Add Grade.
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href={gradeRequestPath(result.id)}>Track this request</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.GRADE_REQUESTS}>All grade requests</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.PRODUCTS_NEW}>Back to Add Grade</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-3xl space-y-5">
      <PageHeader
        title="Request New Grade"
        description="Can't find your grade in the Grade Master? Request it and our team will add it so you can list and offer it to buyers."
        breadcrumbs={[
          { label: "Grade Requests", href: ROUTES.GRADE_REQUESTS },
          { label: "Request New Grade" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span>
          Already in the Grade Master? Selecting it is faster than a new
          request.
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.PRODUCTS_NEW}>
            <Search className="h-4 w-4" aria-hidden />
            Search the Grade Master
          </Link>
        </Button>
      </div>

      {prefillError ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Could not pre-fill your details ({prefillError}). You can enter them
          manually.
        </p>
      ) : null}

      <SubmitProblem
        error={submitError}
        onConfirmAnyway={() => {
          setAcknowledgeExisting(true);
          setSubmitError(null);
        }}
      />

      <form onSubmit={submit} noValidate className="space-y-6">
        <Section title="Grade details">
          <Field
            label="Grade name / number"
            required
            error={errors.gradeName}
            htmlFor="gr-grade"
          >
            <Input
              id="gr-grade"
              value={form.gradeName}
              maxLength={120}
              onChange={(e) => set("gradeName", e.target.value)}
              placeholder="e.g. F4811"
            />
          </Field>
          <Field
            label="Material / category"
            required
            error={errors.materialCategory}
            htmlFor="gr-material"
          >
            <Input
              id="gr-material"
              value={form.materialCategory}
              maxLength={120}
              onChange={(e) => set("materialCategory", e.target.value)}
              placeholder="e.g. White Masterbatch"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Manufacturer" htmlFor="gr-mfr">
              <Input
                id="gr-mfr"
                value={form.manufacturer}
                maxLength={120}
                onChange={(e) => set("manufacturer", e.target.value)}
              />
            </Field>
            <Field label="Grade group" htmlFor="gr-group">
              <Input
                id="gr-group"
                value={form.gradeGroup}
                maxLength={120}
                onChange={(e) => set("gradeGroup", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Application / intended use" htmlFor="gr-app">
            <Input
              id="gr-app"
              value={form.application}
              maxLength={200}
              onChange={(e) => set("application", e.target.value)}
            />
          </Field>
          <Field
            label="Technical specifications"
            htmlFor="gr-specs"
            hint="MFI, density, additives, certifications…"
          >
            <Textarea
              id="gr-specs"
              rows={3}
              value={form.technicalSpecs}
              maxLength={4000}
              onChange={(e) => set("technicalSpecs", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Quantity and dispatch">
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Field
              label="Quantity you can supply"
              required
              error={errors.quantity}
              htmlFor="gr-qty"
            >
              <Input
                id="gr-qty"
                inputMode="decimal"
                value={form.quantity}
                onChange={(e) =>
                  set(
                    "quantity",
                    e.target.value.replace(/[^0-9.]/g, "").slice(0, 12),
                  )
                }
                placeholder="e.g. 25"
              />
            </Field>
            <Field label="Unit" htmlFor="gr-unit">
              <select
                id="gr-unit"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.unit}
                onChange={(e) =>
                  set("unit", e.target.value as GradeRequestUnit)
                }
              >
                {GRADE_REQUEST_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Warehouse / dispatch location"
            required
            error={errors.deliveryLocation}
            htmlFor="gr-loc"
          >
            <Textarea
              id="gr-loc"
              rows={2}
              value={form.deliveryLocation}
              maxLength={255}
              onChange={(e) => set("deliveryLocation", e.target.value)}
              placeholder="City, state — or the full warehouse address"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Pincode"
              error={errors.deliveryPincode}
              htmlFor="gr-pin"
            >
              <Input
                id="gr-pin"
                inputMode="numeric"
                value={form.deliveryPincode}
                onChange={(e) =>
                  set("deliveryPincode", digitsOnly(e.target.value, 6))
                }
                placeholder="6 digits"
              />
            </Field>
            <Field
              label="Available from"
              error={errors.requiredByDate}
              htmlFor="gr-date"
            >
              <Input
                id="gr-date"
                type="date"
                min={todayIso()}
                value={form.requiredByDate}
                onChange={(e) => set("requiredByDate", e.target.value)}
              />
            </Field>
            <Field label="Packaging" htmlFor="gr-pack">
              <Input
                id="gr-pack"
                value={form.preferredPackaging}
                maxLength={120}
                onChange={(e) => set("preferredPackaging", e.target.value)}
                placeholder="e.g. 25 kg bags"
              />
            </Field>
          </div>
        </Section>

        <Section title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Contact person"
              required
              error={errors.contactName}
              htmlFor="gr-cname"
            >
              <Input
                id="gr-cname"
                value={form.contactName}
                maxLength={120}
                onChange={(e) => set("contactName", e.target.value)}
              />
            </Field>
            <Field
              label="Mobile number"
              required
              error={errors.contactPhone}
              htmlFor="gr-cphone"
            >
              <Input
                id="gr-cphone"
                inputMode="tel"
                value={form.contactPhone}
                onChange={(e) =>
                  set("contactPhone", digitsOnly(e.target.value, 10))
                }
                placeholder="10-digit mobile"
              />
            </Field>
          </div>
          <Field label="Email" error={errors.contactEmail} htmlFor="gr-cemail">
            <Input
              id="gr-cemail"
              type="email"
              value={form.contactEmail}
              maxLength={160}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </Field>
          {prefill?.companyName ? (
            <p className="text-xs text-slate-500">
              Requesting for {prefill.companyName}.
            </p>
          ) : null}
        </Section>

        <Section title="Attachments (optional)">
          <p className="text-xs text-slate-500">
            TDS, specification, MSDS or COA — PDF, JPG, PNG or WebP, up to{" "}
            {maxFiles} files, {Math.round(maxBytes / 1024 / 1024)} MB each.
          </p>
          {limits && !limits.storageConfigured ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              File upload is temporarily unavailable. You can still submit and
              attach files later.
            </p>
          ) : null}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <Paperclip className="h-4 w-4" aria-hidden />
            Add files
            <input
              type="file"
              className="sr-only"
              multiple
              accept={allowedMime.join(",")}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {errors.files ? (
            <p className="text-xs text-red-600" data-field-error="true">
              {errors.files}
            </p>
          ) : null}
          <ul className="space-y-2">
            {files.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <FileText
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">
                  {item.file.name}
                </span>
                <select
                  aria-label={`Document type for ${item.file.name}`}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={item.type}
                  onChange={(e) =>
                    setFiles((cur) =>
                      cur.map((f) =>
                        f.key === item.key
                          ? {
                              ...f,
                              type: e.target.value as GradeRequestDocumentType,
                            }
                          : f,
                      ),
                    )
                  }
                >
                  {GRADE_REQUEST_DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Remove ${item.file.name}`}
                  onClick={() =>
                    setFiles((cur) => cur.filter((f) => f.key !== item.key))
                  }
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Additional remarks (optional)">
          <Textarea
            aria-label="Additional remarks"
            rows={3}
            value={form.remarks}
            maxLength={2000}
            onChange={(e) => set("remarks", e.target.value)}
          />
        </Section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button asChild type="button" variant="outline">
            <Link href={ROUTES.GRADE_REQUESTS}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-40">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : acknowledgeExisting ? (
              "Submit anyway"
            ) : (
              "Submit request"
            )}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

function SubmitProblem({
  error,
  onConfirmAnyway,
}: {
  error: GradeRequestError | null;
  onConfirmAnyway: () => void;
}) {
  if (!error) return null;

  if (error.code === "GRADE_ALREADY_IN_CATALOGUE" && error.matches?.length) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900"
      >
        <p className="font-medium">
          This grade may already be in the Grade Master
        </p>
        <p className="mt-0.5">
          Search for one of these in Add Grade, or confirm you still want a new
          request.
        </p>
        <ul className="mt-2 space-y-1">
          {error.matches.map((m: CatalogueMatch) => (
            <li key={m.id} className="font-medium">
              {m.name}
              <span className="text-xs font-normal text-sky-700">
                {[m.gradeNo, m.manufacturer].filter(Boolean).length
                  ? ` · ${[m.gradeNo, m.manufacturer].filter(Boolean).join(" · ")}`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={ROUTES.PRODUCTS_NEW}>List an existing grade</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onConfirmAnyway}
          >
            None of these — request a new grade
          </Button>
        </div>
      </div>
    );
  }

  if (error.code === "DUPLICATE_OPEN_REQUEST" && error.existing) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <p className="font-medium">
          You already have an open request for this grade
        </p>
        <p className="mt-0.5">
          Reference {error.existing.referenceNumber}. We will update you there.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href={gradeRequestPath(error.existing.id)}>
            View {error.existing.referenceNumber}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{error.message}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5" data-field-error={error ? "true" : undefined}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-400">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
