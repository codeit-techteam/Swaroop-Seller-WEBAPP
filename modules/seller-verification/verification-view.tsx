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

import { GstValidateCard } from "@/components/onboarding/gst-validate-card";
import { PanVerifyField } from "@/components/onboarding/pan-verify-field";
import { UploadCard } from "@/components/onboarding/upload-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractPanFromGstin } from "@/lib/utils/gst";
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
  isVerificationAccepted,
  type KycVerificationResult,
  toStoreStatus,
} from "@/services/seller-kyc-verification";
import {
  fetchSellerVerificationDetails,
  fetchSellerVerificationStatus,
  IFSC_PATTERN,
  resubmitSellerVerification,
  type SellerVerificationDetails,
  type SellerVerificationStatus,
  updateSellerVerificationDetails,
} from "@/services/seller-verification";
import type { DocumentItem, VerificationStatus } from "@/types/onboarding";

const LOCKED_STATUSES = new Set(["SUBMITTED", "UNDER_REVIEW", "APPROVED"]);

const EMPTY_DETAILS: SellerVerificationDetails = {
  legalName: "",
  gstin: "",
  pan: "",
  gstStatus: null,
  panStatus: null,
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
};

const PAN_GST_MISMATCH =
  "GST/PAN mismatch: the PAN associated with the GSTIN does not match the entered PAN.";

type IdentityState = {
  gstin: string;
  pan: string;
  gstStatus: VerificationStatus;
  panStatus: VerificationStatus;
  gstDetails?: KycVerificationResult["details"];
  panDetails?: KycVerificationResult["details"];
  gstMessage?: string;
  panMessage?: string;
  gstVerification: KycVerificationResult | null;
  panVerification: KycVerificationResult | null;
  mismatch: boolean;
};

function emptyIdentity(details: SellerVerificationDetails): IdentityState {
  return {
    gstin: details.gstin,
    pan: details.pan,
    gstStatus: "idle",
    panStatus: "idle",
    gstVerification: null,
    panVerification: null,
    mismatch: false,
  };
}

function savedIdentityStatus(value: string | null): VerificationStatus {
  if (value === "verified") return "verified";
  if (value === "manual_review") return "pending";
  return "idle";
}

function acceptedStatusLabel(
  apiStatus: KycVerificationResult["status"],
): string | null {
  if (apiStatus === "VERIFIED") return "verified";
  if (apiStatus === "MANUAL_REVIEW") return "manual_review";
  return null;
}

function identityFromStatus(
  details: SellerVerificationDetails,
  status: SellerVerificationStatus,
): IdentityState {
  const gst = status.verifications.gst;
  const pan = status.verifications.pan;
  // Prefer onboarding draft status (cleared when Admin requests identity re-verify).
  const gstStatus = savedIdentityStatus(details.gstStatus);
  const panStatus = savedIdentityStatus(details.panStatus);

  return {
    gstin: details.gstin,
    pan: details.pan,
    gstStatus,
    panStatus,
    gstDetails: gstStatus !== "idle" ? gst?.details : undefined,
    panDetails: panStatus !== "idle" ? pan?.details : undefined,
    gstMessage: gstStatus !== "idle" ? gst?.message : undefined,
    panMessage: panStatus !== "idle" ? pan?.message : undefined,
    gstVerification: gstStatus !== "idle" ? gst : null,
    panVerification: panStatus !== "idle" ? pan : null,
    mismatch:
      gstStatus !== "idle" && panStatus !== "idle"
        ? status.verifications.mismatch
        : false,
  };
}

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

function validateBankAndName(details: SellerVerificationDetails) {
  const errors: Partial<Record<keyof SellerVerificationDetails, string>> = {};
  if (!details.legalName.trim()) errors.legalName = "Legal name is required";
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
          PolyStoreX requested changes to your verification
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
        . You can only replace documents the PolyStoreX team rejects.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      Your verification has not been submitted yet. Verify GST and PAN, upload
      required documents, and submit.
    </div>
  );
}

/** Read-only GST Information card — same fields as Seller App profile. */
function GstInformationCard({
  details,
  identity,
}: {
  details: SellerVerificationDetails;
  identity: IdentityState;
}) {
  const gstLabel = isVerificationAccepted(identity.gstStatus)
    ? identity.gstStatus === "verified"
      ? "Verified"
      : "Manual review"
    : "Pending verification";
  const panLabel = isVerificationAccepted(identity.panStatus)
    ? identity.panStatus === "verified"
      ? "Verified"
      : "Manual review"
    : "Pending verification";
  const rows: [string, string][] = [
    ["GSTIN", details.gstin || "—"],
    ["GST state", identity.gstDetails?.state || "—"],
    ["GST verification", gstLabel],
    ["PAN", details.pan || "—"],
    ["PAN verification", panLabel],
  ];
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          GST Information
        </h2>
        <p className="text-xs text-slate-500">
          Tax registration and compliance details.
        </p>
      </div>
      {details.legalName ? (
        <p className="text-sm font-semibold text-[#0B1F3A]">
          {details.legalName}
        </p>
      ) : null}
      <dl className="divide-y rounded-lg border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 px-3 py-2.5"
          >
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd
              className={
                value === "Verified"
                  ? "text-sm font-medium text-[#0B1F3A]"
                  : "text-sm text-slate-800"
              }
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-slate-500">
        Verified GST and PAN are locked. Contact PolyStoreX support to request
        re-verification.
      </p>
    </section>
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
  const [identity, setIdentity] = useState<IdentityState>(
    emptyIdentity(EMPTY_DETAILS),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const aborts = useRef(new Map<string, () => void>());

  const apply = useCallback((snapshot: VerificationSnapshot) => {
    setStatus(snapshot.status);
    setSlots(snapshot.slots);
    setDetails(snapshot.details);
    setSavedDetails(snapshot.details);
    setIdentity(identityFromStatus(snapshot.details, snapshot.status));
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
  const identityLocked = Boolean(status?.locked) || locked;
  const requestedSlots = useMemo(
    () => new Set(status?.changeRequest?.slots ?? []),
    [status],
  );
  const documents = slots.map((slot) => ({
    slot,
    item: { ...toDocumentItem(slot), ...uploads[slot.slot] },
  }));
  const detailErrors = validateBankAndName(details);
  const bankDirty =
    details.legalName !== savedDetails.legalName ||
    details.accountHolder !== savedDetails.accountHolder ||
    details.bankName !== savedDetails.bankName ||
    details.accountNumber !== savedDetails.accountNumber ||
    details.ifsc !== savedDetails.ifsc;
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

  const gstStatus =
    identity.gstin === details.gstin ? identity.gstStatus : "idle";
  const panStatus = identity.pan === details.pan ? identity.panStatus : "idle";
  const identityAccepted =
    isVerificationAccepted(gstStatus) &&
    isVerificationAccepted(panStatus) &&
    !identity.mismatch;

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

  const applyGstResult = (result: KycVerificationResult, gstin: string) => {
    const gstStatusLabel = acceptedStatusLabel(result.status);
    setDetails((prev) => ({
      ...prev,
      gstin,
      gstStatus: gstStatusLabel,
      legalName:
        prev.legalName.trim() || result.details.legalName || prev.legalName,
    }));
    setIdentity((prev) => ({
      ...prev,
      gstin,
      gstStatus: toStoreStatus(result.status),
      gstDetails: result.details,
      gstMessage: result.message,
      gstVerification: result,
      mismatch: Boolean(result.mismatch),
      pan:
        result.status !== "FAILED" && !prev.pan
          ? extractPanFromGstin(gstin) || prev.pan
          : prev.pan,
    }));
    void fetchSellerVerificationStatus().then((next) => {
      setStatus(next);
      setIdentity((prev) => ({
        ...prev,
        mismatch: next.verifications.mismatch,
        gstVerification: next.verifications.gst ?? prev.gstVerification,
        panVerification: next.verifications.pan ?? prev.panVerification,
      }));
    });
  };

  const applyPanResult = (result: KycVerificationResult, pan: string) => {
    const panStatusLabel = acceptedStatusLabel(result.status);
    setDetails((prev) => ({
      ...prev,
      pan,
      panStatus: panStatusLabel,
    }));
    setIdentity((prev) => ({
      ...prev,
      pan,
      panStatus: toStoreStatus(result.status),
      panDetails: result.details,
      panMessage: result.message,
      panVerification: result,
      mismatch: Boolean(result.mismatch),
    }));
    void fetchSellerVerificationStatus().then((next) => {
      setStatus(next);
      setIdentity((prev) => ({
        ...prev,
        mismatch: next.verifications.mismatch,
        gstVerification: next.verifications.gst ?? prev.gstVerification,
        panVerification: next.verifications.pan ?? prev.panVerification,
      }));
    });
  };

  const resubmit = async () => {
    if (missing.length) {
      toast.error(`Upload required documents: ${missing.join(", ")}`);
      return;
    }
    if (!identityAccepted) {
      toast.error(
        identity.mismatch
          ? PAN_GST_MISMATCH
          : "Verify GST and PAN with Surepass before submitting",
      );
      return;
    }
    if (bankDirty && Object.keys(detailErrors).length) {
      toast.error("Fix the highlighted business details first");
      return;
    }
    if (status?.verificationBlockers?.length) {
      toast.error(
        status.verificationBlockers[0] ??
          "Complete GST and PAN verification before submitting",
      );
      return;
    }
    setSubmitting(true);
    try {
      if (bankDirty) await updateSellerVerificationDetails(details);
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

  type EditableField =
    "legalName" | "accountHolder" | "bankName" | "accountNumber" | "ifsc";

  const field = (
    key: EditableField,
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
      {!locked && bankDirty && detailErrors[key] ? (
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
          GST and PAN are verified via Surepass. Documents are reviewed by the
          PolyStoreX compliance team.
        </p>
      </div>

      <StatusBanner status={status} />

      {identityLocked ? (
        <GstInformationCard details={details} identity={identity} />
      ) : (
        <section className="space-y-4 rounded-xl border bg-white p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              PAN &amp; GST verification
            </h2>
            <p className="text-xs text-slate-500">
              Same Surepass checks as Customer Web and Seller App. Both must
              match before you can submit.
            </p>
          </div>
          <GstValidateCard
            compact
            value={identity.gstin}
            status={gstStatus}
            details={identity.gstDetails}
            message={identity.gstMessage}
            verification={identity.gstVerification}
            locked={identityLocked}
            onChange={(next) => {
              setIdentity((prev) => ({
                ...prev,
                gstin: next,
                gstStatus:
                  prev.gstin !== next && prev.gstStatus !== "idle"
                    ? "idle"
                    : prev.gstStatus,
                gstDetails: prev.gstin !== next ? undefined : prev.gstDetails,
                gstVerification:
                  prev.gstin !== next ? null : prev.gstVerification,
                mismatch: false,
              }));
              setDetails((prev) => ({ ...prev, gstin: next }));
            }}
            onResult={applyGstResult}
            onEdit={() =>
              setIdentity((prev) => ({
                ...prev,
                gstStatus: "idle",
                gstDetails: undefined,
                gstMessage: undefined,
                gstVerification: null,
                mismatch: false,
              }))
            }
          />
          <div className="space-y-1.5">
            <Label>PAN</Label>
            <PanVerifyField
              value={identity.pan}
              status={panStatus}
              details={identity.panDetails}
              message={identity.panMessage}
              verification={identity.panVerification}
              locked={identityLocked}
              onChange={(next) => {
                setIdentity((prev) => ({
                  ...prev,
                  pan: next,
                  panStatus:
                    prev.pan !== next && prev.panStatus !== "idle"
                      ? "idle"
                      : prev.panStatus,
                  panDetails: prev.pan !== next ? undefined : prev.panDetails,
                  panVerification:
                    prev.pan !== next ? null : prev.panVerification,
                  mismatch: false,
                }));
                setDetails((prev) => ({ ...prev, pan: next }));
              }}
              onResult={applyPanResult}
              onEdit={() =>
                setIdentity((prev) => ({
                  ...prev,
                  panStatus: "idle",
                  panDetails: undefined,
                  panMessage: undefined,
                  panVerification: null,
                  mismatch: false,
                }))
              }
            />
            {identity.mismatch ? (
              <p className="text-xs text-red-600" role="alert">
                {PAN_GST_MISMATCH}
              </p>
            ) : null}
          </div>
        </section>
      )}

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
              : "Legal name and settlement bank. GSTIN and PAN are verified above."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {field("legalName", "Legal business name")}
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
          {!identityAccepted ? (
            <p className="text-xs text-amber-700">
              {identity.mismatch
                ? "Resolve the GST/PAN mismatch before submitting."
                : "Verify GSTIN and PAN before submitting."}
            </p>
          ) : null}
          {missing.length ? (
            <p className="text-xs text-amber-700">
              Still required: {missing.join(", ")}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={submitting || uploading || !identityAccepted}
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
