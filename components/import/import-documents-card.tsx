"use client";

import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImportDocuments, useInvalidateImport } from "@/hooks/use-import";
import { formatDate, importLabel, parseImportError } from "@/lib/import/format";
import {
  deleteListingDocument,
  downloadListingDocument,
  uploadListingDocument,
} from "@/services/import";

/** Categories accepted by the backend for Import listing attachments. */
const CATEGORIES = [
  "COA",
  "TDS",
  "SDS",
  "MSDS",
  "CERTIFICATE_OF_ORIGIN",
  "PRODUCT_SPECIFICATION",
  "INSPECTION_CERTIFICATE",
  "COMMERCIAL_INVOICE",
  "PACKING_LIST",
  "BILL_OF_LADING",
  "INSURANCE_CERTIFICATE",
  "OTHER",
];

const CATEGORY_LABEL: Record<string, string> = {
  COA: "Certificate of analysis (COA)",
  TDS: "Technical data sheet (TDS)",
  SDS: "Safety data sheet (SDS)",
  MSDS: "Material safety data sheet (MSDS)",
};

function sizeLabel(bytes: string | null): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportDocumentsCard({
  listingId,
  canManage,
}: {
  listingId: string;
  canManage: boolean;
}) {
  const docs = useImportDocuments(listingId);
  const invalidate = useInvalidateImport();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("COA");
  const [busy, setBusy] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    try {
      await uploadListingDocument(listingId, category, file);
      toast.success(`${file.name} uploaded`);
      await docs.refetch();
      invalidate();
    } catch (error) {
      toast.error(parseImportError(error).message);
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDownload(id: string) {
    setBusy(id);
    try {
      const { url } = await downloadListingDocument(listingId, id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(parseImportError(error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    setBusy(id);
    try {
      await deleteListingDocument(listingId, id);
      await docs.refetch();
    } catch (error) {
      toast.error(parseImportError(error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Attachments</CardTitle>
        <p className="text-sm text-muted-foreground">
          {canManage
            ? "Visible to counterparties only while they are negotiating with you."
            : "Shared by the counterparty for this negotiation."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABEL[c] ?? importLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              disabled={busy === "upload"}
              onClick={() => inputRef.current?.click()}
            >
              {busy === "upload" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Upload />
              )}
              Upload file
            </Button>
            <span className="text-xs text-muted-foreground">
              PDF, JPG, PNG or WebP
            </span>
          </div>
        ) : null}

        {docs.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading attachments…</p>
        ) : docs.isError ? (
          <p className="text-sm text-muted-foreground">
            Attachments are shared once a negotiation is open.
          </p>
        ) : !docs.data?.length ? (
          <p className="text-sm text-muted-foreground">No attachments yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {docs.data.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 px-3 py-2.5 text-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABEL[d.category] ?? importLabel(d.category)} ·{" "}
                    {sizeLabel(d.fileSizeBytes)} · {formatDate(d.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Download ${d.fileName}`}
                  disabled={busy === d.id}
                  onClick={() => void handleDownload(d.id)}
                >
                  <Download />
                </Button>
                {canManage ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${d.fileName}`}
                    disabled={busy === d.id}
                    onClick={() => void handleDelete(d.id)}
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
