"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ExternalLink,
  FileText,
  Loader2,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import type { GradeRequestError } from "@/services/grade-requests";
import {
  cancelGradeRequest,
  fetchGradeRequest,
  fetchGradeRequestPrefill,
  getGradeRequestDocumentUrl,
  GRADE_REQUEST_DOCUMENT_TYPES,
  GRADE_REQUESTS_QUERY_KEY,
  type GradeRequest,
  type GradeRequestDocumentType,
  isAwaitingSellerResponse,
  respondToGradeRequest,
  uploadGradeRequestDocument,
} from "@/services/grade-requests";

import { GradeRequestStatusBadge, sellerStatusLabel } from "./status-badge";

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function GradeRequestDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const detailKey = useMemo(
    () => [...GRADE_REQUESTS_QUERY_KEY, "detail", id] as const,
    [id],
  );
  const query = useQuery<GradeRequest, GradeRequestError>({
    queryKey: detailKey,
    queryFn: () => fetchGradeRequest(id),
    staleTime: 0,
    retry: (count, err) => err.status !== 404 && count < 1,
  });
  const request = query.data ?? null;
  const loading = query.isPending;
  const error = query.error;

  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [docType, setDocType] = useState<GradeRequestDocumentType>("TDS");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Upload limits only matter while the request is open; fall back to safe defaults.
  const isOpen = request?.isOpen ?? false;
  const prefill = useQuery({
    queryKey: [...GRADE_REQUESTS_QUERY_KEY, "prefill"],
    queryFn: fetchGradeRequestPrefill,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const limits = useMemo(() => {
    const l = prefill.data?.limits;
    return {
      maxFiles: l?.maxDocuments ?? DEFAULT_MAX_FILES,
      maxBytes: l?.maxFileSizeBytes ?? DEFAULT_MAX_BYTES,
      mime: l?.allowedMimeTypes ?? DEFAULT_MIME,
      storage: l?.storageConfigured ?? true,
    };
  }, [prefill.data]);

  const publish = (next: GradeRequest) => {
    queryClient.setQueryData(detailKey, next);
    // The list row (status, "needs info" flag) is now stale.
    void queryClient.invalidateQueries({
      queryKey: [...GRADE_REQUESTS_QUERY_KEY, "list"],
    });
  };

  async function act(fn: () => Promise<GradeRequest>) {
    setBusy(true);
    setActionError(null);
    try {
      publish(await fn());
      setReply("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  }

  async function openDocument(documentId: string) {
    setActionError(null);
    try {
      const url = await getGradeRequestDocumentUrl(id, documentId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else setActionError("This file cannot be opened right now.");
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unable to open the file.",
      );
    }
  }

  async function attach(file: File | undefined) {
    if (!file || !request) return;
    setActionError(null);
    if (request.documents.length >= limits.maxFiles) {
      setActionError(`You can attach up to ${limits.maxFiles} files.`);
      return;
    }
    if (!limits.mime.includes(file.type)) {
      setActionError("Only PDF, JPG, PNG or WebP files are allowed.");
      return;
    }
    if (file.size > limits.maxBytes) {
      setActionError(
        `${file.name} is larger than ${Math.round(limits.maxBytes / 1024 / 1024)} MB.`,
      );
      return;
    }
    setUploading(true);
    try {
      await uploadGradeRequestDocument(request.id, docType, file);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unable to attach the file.",
      );
    }
    // Refresh either way: the document row may exist even if the upload step failed.
    try {
      publish(await fetchGradeRequest(request.id));
    } catch {
      /* keep the current view; the error above (if any) is already shown */
    }
    setUploading(false);
  }

  if (loading) {
    return (
      <PageContainer className="max-w-3xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </PageContainer>
    );
  }

  if (error || !request) {
    const notFound = error?.status === 404;
    return (
      <PageContainer className="max-w-3xl">
        {notFound ? (
          <EmptyState
            icon={AlertCircle}
            title="Request not found"
            description={error?.message ?? "This grade request does not exist."}
            action={
              <Button asChild>
                <Link href={ROUTES.GRADE_REQUESTS}>Grade requests</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            icon={AlertCircle}
            title="Unable to load this request"
            description={error?.message ?? "Something went wrong."}
            onRetry={() => void query.refetch()}
          />
        )}
      </PageContainer>
    );
  }

  const r = request;
  const awaiting = isAwaitingSellerResponse(r);
  const rows: Array<[string, string | null]> = [
    ["Material", r.materialCategory],
    ["Manufacturer", r.manufacturer],
    ["Grade group", r.gradeGroup],
    ["Application", r.application],
    ["Quantity", `${r.quantity} ${r.unit}`],
    [
      "Warehouse / dispatch",
      [r.deliveryLocation, r.deliveryPincode].filter(Boolean).join(" – "),
    ],
    ["Required by", r.requiredByDate],
    ["Packaging", r.preferredPackaging],
    ["Contact", `${r.contactName} · ${r.contactPhone}`],
    ["Contact email", r.contactEmail],
    ["Remarks", r.remarks],
  ];

  return (
    <PageContainer className="max-w-3xl space-y-5">
      <PageHeader
        title={r.gradeName}
        description={r.referenceNumber}
        breadcrumbs={[
          { label: "Grade Requests", href: ROUTES.GRADE_REQUESTS },
          { label: r.referenceNumber },
        ]}
        actions={
          <GradeRequestStatusBadge status={r.status} label={r.statusLabel} />
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">{r.statusDescription}</p>
        {r.adminMessage ? (
          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Message from PolyStoreX
            </span>
            {r.adminMessage}
          </p>
        ) : null}
        {r.closureReason &&
        (r.status === "REJECTED" || r.status === "CLOSED") ? (
          <p className="mt-3 text-sm text-slate-700">
            Reason: {r.closureReason}
          </p>
        ) : null}
        {r.resolvedGrade ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-600">
              This grade is now in the catalogue. Pick it from the grade picker
              in Add Grade to list or offer it.
            </p>
            <Button asChild>
              <Link href={ROUTES.PRODUCTS_NEW}>
                List {r.resolvedGrade.name} now
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {awaiting ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <h2 className="text-sm font-semibold text-orange-900">
            We need more information from you to add this grade
          </h2>
          <Textarea
            aria-label="Your response"
            className="mt-3 bg-white"
            rows={4}
            maxLength={2000}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type the information we asked for"
          />
          <Button
            className="mt-3"
            disabled={busy || reply.trim().length < 2}
            onClick={() =>
              void act(() => respondToGradeRequest(r.id, reply.trim()))
            }
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Send response
          </Button>
        </div>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {actionError}
        </p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Request details
        </h2>
        <dl className="divide-y divide-slate-100 text-sm">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 py-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="col-span-2 whitespace-pre-wrap font-medium text-slate-800">
                  {v}
                </dd>
              </div>
            ))}
        </dl>
        {r.technicalSpecs ? (
          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            {r.technicalSpecs}
          </p>
        ) : null}
      </section>

      {r.documents.length || r.isOpen ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Attachments
          </h2>
          {r.documents.length ? (
            <ul className="space-y-1">
              {r.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText
                      className="h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <span className="truncate">{d.fileName}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void openDocument(d.id)}
                  >
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No files attached yet.</p>
          )}
          {r.isOpen ? (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {!limits.storage ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  File upload is temporarily unavailable. Try again later.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Document type"
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={docType}
                    disabled={uploading}
                    onChange={(e) =>
                      setDocType(e.target.value as GradeRequestDocumentType)
                    }
                  >
                    {GRADE_REQUEST_DOCUMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      uploading || r.documents.length >= limits.maxFiles
                    }
                    onClick={() => fileInput.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Paperclip className="h-4 w-4" aria-hidden />
                    )}
                    {uploading ? "Uploading…" : "Attach file"}
                  </Button>
                  <input
                    ref={fileInput}
                    type="file"
                    className="sr-only"
                    accept={limits.mime.join(",")}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      void attach(file);
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-slate-500">
                PDF, JPG, PNG or WebP · up to {limits.maxFiles} files ·{" "}
                {Math.round(limits.maxBytes / 1024 / 1024)} MB each.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Progress
        </h2>
        <ol className="space-y-4">
          {[...r.timeline].reverse().map((e) => (
            <li key={e.id} className="relative border-l border-slate-200 pl-4">
              <span className="absolute -left-1 top-1.5 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm font-medium text-slate-900">
                {e.toStatus && e.toStatusLabel
                  ? sellerStatusLabel(e.toStatus, e.toStatusLabel)
                  : e.type.replaceAll("_", " ").toLowerCase()}
              </p>
              {e.message ? (
                <p className="whitespace-pre-wrap text-sm text-slate-600">
                  {e.message}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-slate-400">
                {e.actor === "YOU" ? "You" : "PolyStoreX"} ·{" "}
                {new Date(e.createdAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {r.isOpen ? (
        <div className="text-center">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            disabled={busy}
            onClick={() => setConfirmCancel(true)}
          >
            Cancel request
          </Button>
        </div>
      ) : null}

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this grade request?</AlertDialogTitle>
            <AlertDialogDescription>
              {r.referenceNumber} will be closed and our team will stop working
              on it. You can submit a new request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep request</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void act(() => cancelGradeRequest(r.id))}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Yes, cancel request
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
