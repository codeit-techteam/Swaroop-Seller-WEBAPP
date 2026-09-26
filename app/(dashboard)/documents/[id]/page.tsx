"use client";

import { Download, Eye } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DocumentsPageSkeleton } from "@/components/skeleton";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  fetchSellerDocumentById,
  getSellerDocumentDownloadUrl,
  getSellerDocumentPreviewUrl,
  openSignedDocumentUrl,
  sellerDocumentsApiError,
} from "@/services/seller-documents";
import { useSellerFinanceStore } from "@/store/sellerFinanceStore";
import type { SellerDocumentRecord } from "@/types/seller";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const storeDocuments = useSellerFinanceStore((s) => s.documents);
  const hydrateDocuments = useSellerFinanceStore((s) => s.hydrateDocuments);
  const [document, setDocument] = useState<SellerDocumentRecord | null>(
    () => storeDocuments.find((item) => item.id === params.id) ?? null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [loading, setLoading] = useState(!document);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (storeDocuments.length === 0) {
          await hydrateDocuments();
        }
        const fromStore = useSellerFinanceStore
          .getState()
          .documents.find((item) => item.id === params.id);
        const resolved =
          fromStore ?? (await fetchSellerDocumentById(params.id));
        if (cancelled) return;
        setDocument(resolved);
        setLoading(false);

        setPreviewLoading(true);
        const preview = await getSellerDocumentPreviewUrl(resolved.id);
        if (cancelled) return;
        setPreviewUrl(preview.url);
        setPreviewMime(preview.mimeType ?? resolved.mimeType ?? null);
        setPreviewLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        setPreviewLoading(false);
        setError(sellerDocumentsApiError(err, "Unable to load document."));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrateDocuments, params.id, storeDocuments.length]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      const result = await getSellerDocumentDownloadUrl(document.id);
      openSignedDocumentUrl(result.url, result.fileName ?? document.fileName);
      toast.success("Download started");
    } catch (err) {
      toast.error(sellerDocumentsApiError(err, "Unable to download document."));
    }
  };

  if (loading) {
    return <DocumentsPageSkeleton />;
  }

  if (error || !document) {
    return (
      <PageContainer>
        <PageHeader title="Document" />
        {error ? (
          <ErrorState title={error} onRetry={() => window.location.reload()} />
        ) : (
          <EmptyState
            title="Document not found"
            description="This document is not in your seller document centre."
          />
        )}
      </PageContainer>
    );
  }

  const isImage =
    previewMime?.startsWith("image/") ||
    /\.(png|jpe?g|webp)$/i.test(document.fileName);

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title={document.name}
        description={document.category}
        actions={
          <div className="flex items-center gap-2">
            <SellerStatusBadge status={document.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleDownload()}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["File", document.fileName],
          ["Uploaded on", formatDate(document.uploadedAt)],
          ["Expiry", document.expiresAt ? formatDate(document.expiresAt) : "—"],
          ["Version", String(document.version ?? 1)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium text-slate-700">
          <Eye className="h-4 w-4" />
          Document preview
        </div>
        <div className="h-[70vh] bg-slate-50">
          {previewLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading preview…
            </div>
          ) : previewUrl && isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={document.name}
              className="h-full w-full object-contain"
            />
          ) : previewUrl ? (
            <iframe
              title={document.name}
              src={previewUrl}
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Preview unavailable
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
