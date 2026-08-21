"use client";

import {
  CheckCircle2,
  ExternalLink,
  FileText,
  RotateCcw,
  Upload,
  XCircle,
} from "lucide-react";
import {
  type ChangeEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog } from "@/components/cx";
import { ActionDrawer } from "@/components/erp/action-drawer";
import { OpsStatusBadge } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/customerStore";
import type {
  CustomerDocument,
  CustomerDocumentType,
  CustomerKycStatus,
  CustomerProfile,
} from "@/types/customers";
import {
  CUSTOMER_DOCUMENT_TYPE_LABELS,
  ONBOARDING_DOCUMENT_TYPES,
} from "@/types/customers";

interface CustomerDocsDrawerProps {
  open: boolean;
  customer: CustomerProfile | null;
  onClose: () => void;
}

type DocAction = {
  documentId: string;
  status: CustomerKycStatus;
};

const STATUS_DOT: Record<string, string> = {
  VERIFIED: "bg-emerald-500",
  PENDING: "bg-amber-400",
  UNDER_REVIEW: "bg-sky-500",
  REJECTED: "bg-red-500",
  SUSPENDED: "bg-slate-400",
};

export function CustomerDocsDrawer({
  open,
  customer,
  onClose,
}: CustomerDocsDrawerProps) {
  const liveCustomer = useCustomerStore((s) =>
    customer ? s.getCustomer(customer.id) : undefined,
  );
  const setDocumentStatus = useCustomerStore((s) => s.setDocumentStatus);
  const uploadDocument = useCustomerStore((s) => s.uploadDocument);
  const profile = liveCustomer ?? customer;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<DocAction | null>(null);
  const [reason, setReason] = useState("");
  const [uploadingType, setUploadingType] =
    useState<CustomerDocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultSelectedId = useMemo(() => {
    if (!open || !profile) return null;
    const needsReview = profile.documents.find(
      (doc) => doc.status === "PENDING" || doc.status === "UNDER_REVIEW",
    );
    return needsReview?.id ?? profile.documents[0]?.id ?? null;
  }, [open, profile]);

  const resolvedSelectedId =
    selectedId && profile?.documents.some((doc) => doc.id === selectedId)
      ? selectedId
      : defaultSelectedId;

  const selected = useMemo(
    () =>
      profile?.documents.find((doc) => doc.id === resolvedSelectedId) ?? null,
    [profile, resolvedSelectedId],
  );

  const missingTypes = useMemo(() => {
    if (!profile) return [] as CustomerDocumentType[];
    const have = new Set(profile.documents.map((doc) => doc.type));
    return ONBOARDING_DOCUMENT_TYPES.filter((type) => !have.has(type));
  }, [profile]);

  const progress = useMemo(() => {
    if (!profile) return { verified: 0, total: 0, pending: 0, rejected: 0 };
    const total = profile.documents.length;
    const verified = profile.documents.filter(
      (d) => d.status === "VERIFIED",
    ).length;
    const rejected = profile.documents.filter(
      (d) => d.status === "REJECTED",
    ).length;
    const pendingCount = profile.documents.filter(
      (d) => d.status === "PENDING" || d.status === "UNDER_REVIEW",
    ).length;
    return { verified, total, pending: pendingCount, rejected };
  }, [profile]);

  if (!profile) return null;

  const handleUploadClick = (type: CustomerDocumentType) => {
    setUploadingType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const type = uploadingType;
    event.target.value = "";
    setUploadingType(null);
    if (!file || !type) return;

    const sizeMb = Math.max(0.1, file.size / (1024 * 1024));
    await uploadDocument(
      profile.id,
      type,
      file.name,
      `${sizeMb.toFixed(1)} MB`,
    );
    toast.success(`${CUSTOMER_DOCUMENT_TYPE_LABELS[type]} uploaded`);
  };

  const footer = selected ? (
    <DocumentActions
      document={selected}
      onVerify={() =>
        setPending({ documentId: selected.id, status: "VERIFIED" })
      }
      onCorrection={() =>
        setPending({ documentId: selected.id, status: "PENDING" })
      }
      onReject={() =>
        setPending({ documentId: selected.id, status: "REJECTED" })
      }
      onReplace={() => handleUploadClick(selected.type)}
    />
  ) : null;

  return (
    <>
      <ActionDrawer
        open={open}
        onClose={onClose}
        title="Customer documents"
        description={`${profile.name} · ${profile.companyName} · ${profile.customerId}`}
        widthClassName="w-full max-w-3xl"
        footer={footer}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <OpsStatusBadge status={profile.kycStatus} />
              <span className="text-sm text-slate-600">
                {progress.verified} of {progress.total} documents verified
              </span>
            </div>
            {progress.pending > 0 || progress.rejected > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {progress.pending > 0 ? (
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700 ring-1 ring-amber-200/80">
                    {progress.pending} need review
                  </span>
                ) : null}
                {progress.rejected > 0 ? (
                  <span className="rounded-md bg-red-50 px-2 py-1 text-red-700 ring-1 ring-red-200/80">
                    {progress.rejected} rejected
                  </span>
                ) : null}
              </div>
            ) : progress.total > 0 ? (
              <span className="text-xs font-medium text-emerald-700">
                All uploads verified
              </span>
            ) : null}
          </div>
          {progress.total > 0 ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.round((progress.verified / progress.total) * 100)}%`,
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-2">
            <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Onboarding uploads
            </p>
            {profile.documents.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
                No documents uploaded yet.
              </p>
            ) : (
              <div
                className="space-y-1.5"
                role="listbox"
                aria-label="Documents"
              >
                {profile.documents.map((doc) => {
                  const active = resolvedSelectedId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setSelectedId(doc.id)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2.5 text-left transition",
                        active
                          ? "border-[#1B6EF3] bg-blue-50/70 shadow-sm shadow-blue-100/60"
                          : "border-transparent bg-white ring-1 ring-slate-200/80 hover:border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            STATUS_DOT[doc.status] ?? "bg-slate-300",
                          )}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {doc.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {doc.uploadedAt} · {doc.sizeLabel}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {missingTypes.length > 0 ? (
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-3">
                <p className="text-xs font-semibold text-amber-800">
                  Missing from onboarding
                </p>
                <div className="mt-2 space-y-1.5">
                  {missingTypes.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      className="h-8 w-full justify-start border-amber-200 bg-white text-xs text-amber-900 hover:bg-amber-50"
                      onClick={() => handleUploadClick(type)}
                    >
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      Upload {CUSTOMER_DOCUMENT_TYPE_LABELS[type]}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-4">
            {selected ? (
              <DocumentPreview document={selected} />
            ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                <FileText className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">Select a document to review</p>
              </div>
            )}
          </div>
        </div>
      </ActionDrawer>

      <ConfirmActionDialog
        open={Boolean(pending)}
        title={
          pending?.status === "VERIFIED"
            ? "Verify this document?"
            : pending?.status === "REJECTED"
              ? "Reject this document?"
              : "Request document correction?"
        }
        description="The customer will see the updated document status in APP/WEB."
        reasonRequired={pending?.status === "REJECTED"}
        reason={reason}
        onReasonChange={setReason}
        destructive={pending?.status === "REJECTED"}
        onCancel={() => {
          setPending(null);
          setReason("");
        }}
        onConfirm={async () => {
          if (!pending) return;
          await setDocumentStatus(
            profile.id,
            pending.documentId,
            pending.status,
            reason,
          );
          toast.success("Document status updated");
          setPending(null);
          setReason("");
        }}
      />
    </>
  );
}

function DocumentPreview({ document }: { document: CustomerDocument }) {
  const isImage =
    document.previewMimeType === "image/png" ||
    document.previewMimeType === "image/jpeg";
  const isPdf = document.previewMimeType === "application/pdf";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.previewUrl}
            alt={document.name}
            className="h-64 w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <FileText className="h-7 w-7 text-[#1B6EF3]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {document.fileName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {isPdf ? "PDF document" : "Document"} · {document.sizeLabel}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-1 border-slate-200 bg-white"
              asChild
            >
              <a href={document.previewUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open file
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-slate-100 bg-white p-3.5 sm:grid-cols-3">
        <Meta label="Document" value={document.name} />
        <Meta
          label="Status"
          value={<OpsStatusBadge status={document.status} />}
        />
        <Meta label="File" value={document.fileName} />
        <Meta label="Size" value={document.sizeLabel} />
        <Meta label="Uploaded" value={document.uploadedAt} />
        <Meta label="Verified by" value={document.verifiedBy || "—"} />
      </div>

      {document.rejectionReason ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm leading-relaxed text-red-700">
          <span className="font-semibold">Rejection note · </span>
          {document.rejectionReason}
        </p>
      ) : null}
    </div>
  );
}

function DocumentActions({
  document,
  onVerify,
  onCorrection,
  onReject,
  onReplace,
}: {
  document: CustomerDocument;
  onVerify: () => void;
  onCorrection: () => void;
  onReject: () => void;
  onReplace: () => void;
}) {
  const isVerified = document.status === "VERIFIED";
  const isRejected = document.status === "REJECTED";
  const needsDecision =
    document.status === "PENDING" || document.status === "UNDER_REVIEW";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">
          {document.name}
        </p>
        <p className="text-xs text-slate-500">
          {isVerified
            ? "Already verified — request a correction if something looks wrong."
            : isRejected
              ? "Rejected — replace the file or reverse the decision."
              : "Review the file, then verify, request a fix, or reject."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {needsDecision || isRejected ? (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={onVerify}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Verify
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="border-slate-200"
          onClick={onCorrection}
          disabled={document.status === "PENDING"}
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Correction
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onReject}
          disabled={isRejected}
        >
          <XCircle className="mr-1.5 h-4 w-4" />
          Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-200"
          onClick={onReplace}
        >
          <Upload className="mr-1.5 h-4 w-4" />
          Replace
        </Button>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  );
}
