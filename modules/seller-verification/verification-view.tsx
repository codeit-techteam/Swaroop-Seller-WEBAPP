"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquareWarning,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { UploadCard } from "@/components/onboarding/upload-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyStoredDocument,
  confirmOnboardingDocument,
  createOnboardingDocumentUpload,
  deleteOnboardingDocument,
  downloadOnboardingDocument,
  listOnboardingDocuments,
  onboardingApiError,
  type OnboardingDocumentSlot,
  type OnboardingDocumentSlotCode,
  putFileToSignedUrl,
} from "@/services/onboarding-documents";
import {
  fetchSellerVerificationDetails,
  fetchSellerVerificationStatus,
  GSTIN_PATTERN,
  IFSC_PATTERN,
  PAN_PATTERN,
  resubmitSellerVerification,
  type SellerVerificationDetails,
  type SellerVerificationStatus,
  updateSellerVerificationDetails,
} from "@/services/seller-verification";
import type { DocumentItem } from "@/types/onboarding";

const LOCKED_STATUSES = new Set(["SUBMITTED", "UNDER_REVIEW", "APPROVED"]);

const EMPTY_DETAILS: SellerVerificationDetails = {
  legalName: "",
  gstin: "",
  pan: "",
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
};

function toDocumentItem(slot: OnboardingDocumentSlot): DocumentItem {
  const base: DocumentItem = {
    id: slot.slot,
    name: slot.name,
    description: slot.description,
    required: slot.required,
    status: "empty",
  };
  return slot.document
    ? { ...base, ...applyStoredDocument(slot.document) }
    : base;
}

function validateDetails(details: SellerVerificationDetails) {
  const errors: Partial<Record<keyof SellerVerificationDetails, string>> = {};
  if (!details.legalName.trim()) errors.legalName = "Legal name is required";
  if (!GSTIN_PATTERN.test(details.gstin))
    errors.gstin = "Enter a valid 15-character GSTIN";
  if (!PAN_PATTERN.test(details.pan))
    errors.pan = "Enter a valid 10-character PAN";
  if (!/^\d{9,18}$/.test(details.accountNumber)) {
    errors.accountNumber = "Account number must be 9–18 digits";
  }
  if (!IFSC_PATTERN.test(details.ifsc))
    errors.ifsc = "Enter a valid IFSC (e.g. HDFC0001234)";
  if (!details.accountHolder.trim())
    errors.accountHolder = "Account holder is required";
  return errors;
}

type VerificationSnapshot = {
  status: SellerVerificationStatus;
  slots: OnboardingDocumentSlot[];
  details: SellerVerificationDetails;
};

async function fetchSnapshot(): Promise<VerificationSnapshot> {
  const [status, slots, details] = await Promise.all([
    fetchSellerVerificationStatus(),
    listOnboardingDocuments(),
    fetchSellerVerificationDetails(),
  ]);
  return { status, slots, details };
}

function StatusBanner({ status }: { status: SellerVerificationStatus }) {
  if (status.changeRequest) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
        <p className="flex items-center gap-2 font-semibold">
          <MessageSquareWarning className="h-4 w-4" />
          PetroTrade requested changes to your verification
        </p>
        <p className="mt-2 whitespace-pre-line text-sm">
          {status.changeRequest.reason}
        </p>
        <p className="mt-2 text-xs text-amber-800/80">
          Requested{" "}
          {new Date(status.changeRequest.requestedAt).toLocaleString()}. Update
          the highlighted documents or details below, then resubmit for review.
        </p>
      </div>
    );
  }
  if (status.status === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
        <p className="flex items-center gap-2 font-semibold">
          <XCircle className="h-4 w-4" /> Verification rejected
        </p>
        {status.rejectedReason ? (
          <p className="mt-2 whitespace-pre-line text-sm">
            {status.rejectedReason}
          </p>
        ) : null}
        <p className="mt-2 text-xs">
          Fix the issues below and resubmit, or contact support.
        </p>
      </div>
    );
  }
  if (status.status === "APPROVED" || status.sellerStatus === "APPROVED") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        <CheckCircle2 className="h-4 w-4" /> Your seller account is verified.
      </div>
    );
  }
  if (LOCKED_STATUSES.has(status.status)) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Clock className="h-4 w-4" />
        Under review since{" "}
        {status.submittedAt
          ? new Date(status.submittedAt).toLocaleString()
          : "submission"}
        . You can only replace documents the PetroTrade team rejects.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      Your verification has not been submitted yet. Upload all required
      documents and submit.
    </div>
  );
}

export function SellerVerificationView() {
  const [status, setStatus] = useState<SellerVerificationStatus | null>(null);
  const [slots, setSlots] = useState<OnboardingDocumentSlot[]>([]);
  const [uploads, setUploads] = useState<Record<string, Partial<DocumentItem>>>(
    {},
  );
  const [details, setDetails] =
    useState<SellerVerificationDetails>(EMPTY_DETAILS);
  const [savedDetails, setSavedDetails] =
    useState<SellerVerificationDetails>(EMPTY_DETAILS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const aborts = useRef(new Map<string, () => void>());

  const apply = useCallback((snapshot: VerificationSnapshot) => {
    setStatus(snapshot.status);
    setSlots(snapshot.slots);
    setDetails(snapshot.details);
    setSavedDetails(snapshot.details);
  }, []);

  const load = useCallback(async () => apply(await fetchSnapshot()), [apply]);

  useEffect(() => {
    let cancelled = false;
    fetchSnapshot()
      .then((snapshot) => {
        if (!cancelled) apply(snapshot);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            onboardingApiError(error, "Could not load your verification"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const pending = aborts.current;
    return () => {
      cancelled = true;
      pending.forEach((abort) => abort());
    };
  }, [apply]);

  const locked = status ? LOCKED_STATUSES.has(status.status) : true;
  const requestedSlots = useMemo(
    () => new Set(status?.changeRequest?.slots ?? []),
    [status],
  );
  const documents = slots.map((slot) => ({
    slot,
    item: { ...toDocumentItem(slot), ...uploads[slot.slot] },
  }));
  const detailErrors = validateDetails(details);
  const detailsDirty = JSON.stringify(details) !== JSON.stringify(savedDetails);
  const uploading = Object.values(uploads).some(
    (patch) => patch.status === "uploading",
  );
  const missing = documents
    .filter(
      ({ item }) =>
        item.required &&
        (item.status === "empty" || item.status === "rejected"),
    )
    .map(({ item }) => item.name);

  const upload = async (slot: OnboardingDocumentSlotCode, file: File) => {
    setUploads((prev) => ({
      ...prev,
      [slot]: {
        status: "uploading",
        fileName: file.name,
        fileSize: file.size,
        uploadProgress: 0,
      },
    }));
    let createdId: string | null = null;
    try {
      const created = await createOnboardingDocumentUpload({ slot, file });
      createdId = created.id;
      const put = putFileToSignedUrl(
        created.uploadUrl,
        file,
        created.mimeType,
        (percent) =>
          setUploads((prev) => ({
            ...prev,
            [slot]: { ...prev[slot], uploadProgress: percent },
          })),
      );
      aborts.current.set(slot, put.abort);
      await put.promise;
      await confirmOnboardingDocument(created.id);
      const [nextSlots, nextStatus] = await Promise.all([
        listOnboardingDocuments(),
        fetchSellerVerificationStatus(),
      ]);
      setSlots(nextSlots);
      setStatus(nextStatus);
      toast.success(`${file.name} uploaded`);
    } catch (error) {
      if (createdId)
        void deleteOnboardingDocument(createdId).catch(() => undefined);
      toast.error(
        onboardingApiError(error, "Upload failed. Please try again."),
      );
    } finally {
      aborts.current.delete(slot);
      setUploads((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
    }
  };

  const preview = async (documentId: string) => {
    try {
      const { url } = await downloadOnboardingDocument(documentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(onboardingApiError(error, "Could not open the document"));
    }
  };

  const resubmit = async () => {
    if (missing.length) {
      toast.error(`Upload required documents: ${missing.join(", ")}`);
      return;
    }
    if (detailsDirty && Object.keys(detailErrors).length) {
      toast.error("Fix the highlighted business details first");
      return;
    }
    setSubmitting(true);
    try {
      if (detailsDirty) await updateSellerVerificationDetails(details);
      await resubmitSellerVerification();
      await load();
      toast.success(
        "Submitted for review. We'll notify you once it is verified.",
      );
    } catch (error) {
      toast.error(onboardingApiError(error, "Could not submit for review"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#1B6EF3]" />
      </div>
    );
  }

  if (loadError || !status) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-dashed p-6 text-sm text-slate-600">
          {loadError ?? "Could not load your verification."}{" "}
          <button
            type="button"
            className="font-medium text-[#1B6EF3] underline"
            onClick={() => {
              setLoadError(null);
              setLoading(true);
              void load()
                .catch((error) =>
                  setLoadError(
                    onboardingApiError(
                      error,
                      "Could not load your verification",
                    ),
                  ),
                )
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const field = (
    key: keyof SellerVerificationDetails,
    label: string,
    transform?: (v: string) => string,
  ) => (
    <div className="grid gap-1.5">
      <Label htmlFor={`verification-${key}`}>{label}</Label>
      <Input
        id={`verification-${key}`}
        value={details[key]}
        disabled={locked || submitting}
        onChange={(event) =>
          setDetails((prev) => ({
            ...prev,
            [key]: transform
              ? transform(event.target.value)
              : event.target.value,
          }))
        }
      />
      {!locked && detailsDirty && detailErrors[key] ? (
        <p className="text-xs text-destructive">{detailErrors[key]}</p>
      ) : null}
    </div>
  );
  const upper = (value: string) => value.toUpperCase().replace(/\s/g, "");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0B1F3A]">
          Seller verification
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Documents are stored securely and reviewed by the PetroTrade
          compliance team.
        </p>
      </div>

      <StatusBanner status={status} />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
        <div className="grid gap-4">
          {documents.map(({ slot, item }) => {
            const rejected = slot.document?.status === "REJECTED";
            const slotLocked = locked && !rejected;
            return (
              <UploadCard
                key={slot.slot}
                document={item}
                locked={slotLocked}
                highlighted={requestedSlots.has(slot.slot) || rejected}
                onUpload={(file) => void upload(slot.slot, file)}
                onReplace={(file) => void upload(slot.slot, file)}
                onCancel={() => aborts.current.get(slot.slot)?.()}
                onPreview={
                  item.storageDocumentId
                    ? () => void preview(item.storageDocumentId as string)
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Business details
          </h2>
          <p className="text-xs text-slate-500">
            {locked
              ? "Locked while under review."
              : "Correct anything the reviewer flagged. Changes are saved when you resubmit."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {field("legalName", "Legal business name")}
          {field("gstin", "GSTIN", upper)}
          {field("pan", "PAN", upper)}
          {field("accountHolder", "Account holder name")}
          {field("bankName", "Bank name")}
          {field("accountNumber", "Account number", (v) =>
            v.replace(/\D/g, ""),
          )}
          {field("ifsc", "IFSC", upper)}
        </div>
      </section>

      {!locked ? (
        <div className="flex flex-col items-end gap-2">
          {missing.length ? (
            <p className="text-xs text-amber-700">
              Still required: {missing.join(", ")}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={submitting || uploading}
            onClick={() => void resubmit()}
          >
            {submitting
              ? "Submitting…"
              : status.changeRequest || status.status === "REJECTED"
                ? "Resubmit for review"
                : "Submit for review"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
