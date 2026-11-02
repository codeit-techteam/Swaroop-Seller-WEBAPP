"use client";

import {
  BadgeCheck,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  fetchSellerProductGradeTds,
  type SellerGradeTdsResponse,
} from "@/services/grade-tds";
import {
  archiveProductDocument,
  downloadProductDocument,
  listProductDocuments,
  PRODUCT_DOCUMENT_TYPE_OPTIONS,
  type ProductDocumentType,
  type SellerProductDocument,
  uploadProductDocument,
} from "@/services/product-documents";

function formatBytes(value?: string | null) {
  const n = Number(value ?? 0);
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value.toUpperCase();
}

type Props = {
  productId: string | null;
  pendingFiles: PendingDoc[];
  onPendingChange: (files: PendingDoc[]) => void;
};

export type PendingDoc = {
  id: string;
  documentType: ProductDocumentType;
  title: string;
  description: string;
  file: File;
};

export function ProductDocumentsPanel({
  productId,
  pendingFiles,
  onPendingChange,
}: Props) {
  const [docs, setDocs] = useState<SellerProductDocument[]>([]);
  const [gradeTds, setGradeTds] = useState<SellerGradeTdsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeTdsLoading, setGradeTdsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState<ProductDocumentType>("TDS");
  const [title, setTitle] = useState("Technical Data Sheet");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const refresh = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      setDocs(await listProductDocuments(productId));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load documents",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const refreshGradeTds = useCallback(async () => {
    if (!productId) {
      setGradeTds(null);
      return;
    }
    setGradeTdsLoading(true);
    try {
      setGradeTds(await fetchSellerProductGradeTds(productId));
    } catch {
      // Platform library is optional — keep seller uploads usable if lookup fails.
      setGradeTds(null);
    } finally {
      setGradeTdsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load docs on mount/id change
    void refresh();
  }, [refresh]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load platform TDS on mount/id change
    void refreshGradeTds();
  }, [refreshGradeTds]);

  useEffect(() => {
    const opt = PRODUCT_DOCUMENT_TYPE_OPTIONS.find(
      (item) => item.value === documentType,
    );
    if (opt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- derive title from type
      setTitle(opt.label.split("—")[1]?.trim() || opt.label);
    }
  }, [documentType]);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20 MB)");
      return;
    }
    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Choose a file first");
      return;
    }

    if (!productId) {
      onPendingChange([
        ...pendingFiles,
        {
          id: `pending-${Date.now()}`,
          documentType,
          title,
          description,
          file: selectedFile,
        },
      ]);
      setSelectedFile(null);
      setDescription("");
      toast.success("Document queued — will upload after product is saved");
      return;
    }

    setUploading(true);
    try {
      await uploadProductDocument(productId, {
        documentType,
        title,
        description,
        file: selectedFile,
      });
      setSelectedFile(null);
      setDescription("");
      toast.success(`${documentType} uploaded successfully`);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: SellerProductDocument) => {
    if (!productId) return;
    try {
      const { url } = await downloadProductDocument(productId, doc.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Unable to download document");
    }
  };

  const handleArchive = async (doc: SellerProductDocument) => {
    if (!productId) return;
    try {
      await archiveProductDocument(productId, doc.id);
      toast.success("Document archived");
      await refresh();
    } catch {
      toast.error("Unable to archive document");
    }
  };

  const platformProductName =
    gradeTds?.product?.name ?? gradeTds?.grade?.name ?? null;
  const platformManufacturer =
    gradeTds?.product?.manufacturer ??
    gradeTds?.grade?.manufacturer ??
    gradeTds?.items[0]?.manufacturer ??
    null;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      {productId ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Platform TDS (verified)
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Customers see this verified technical data sheet on the grade
                page. Read-only platform library — not your uploads.
              </p>
            </div>
            {gradeTdsLoading ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking…
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className={
                  gradeTds?.available
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }
              >
                {gradeTds?.available ? "Available" : "Unavailable"}
              </Badge>
            )}
          </div>

          {!gradeTdsLoading ? (
            <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
              <div>
                <dt className="font-medium text-slate-500">Product</dt>
                <dd className="mt-0.5 text-slate-800">
                  {platformProductName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Manufacturer</dt>
                <dd className="mt-0.5 text-slate-800">
                  {platformManufacturer ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">File format</dt>
                <dd className="mt-0.5 text-slate-800">
                  {gradeTds?.items[0]
                    ? formatLabel(gradeTds.items[0].format)
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : null}

          {!gradeTdsLoading && gradeTds?.items.length ? (
            <ul className="mt-3 space-y-1.5">
              {gradeTds.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-md border border-emerald-100 bg-white/80 px-2.5 py-2 text-xs text-slate-700"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {formatLabel(item.format)}
                    {item.fileName ? ` · ${item.fileName}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {!gradeTdsLoading && !gradeTds?.available ? (
            <p className="mt-2 text-xs text-slate-500">
              {gradeTds?.message ??
                "No verified platform TDS is linked to this product yet."}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-3 py-2.5 text-xs text-slate-500">
          Platform TDS status appears after the product is saved and linked to a
          catalogue grade.
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Your uploads (optional)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Upload TDS and/or MSDS if available. Both are optional — you can save
          the grade without documents and add them later. These are separate
          from the verified platform library above.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Document Type</Label>
          <Select
            value={documentType}
            onValueChange={(v) => setDocumentType(v as ProductDocumentType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_DOCUMENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Document Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional note for your team"
        />
      </div>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
          isDragActive
            ? "border-slate-400 bg-white"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-5 w-5 text-slate-400" />
        <p className="text-sm text-slate-700">
          {selectedFile
            ? selectedFile.name
            : isDragActive
              ? "Drop file here"
              : "Drag & drop or browse (PDF, DOC, XLS, images)"}
        </p>
        <p className="mt-1 text-xs text-slate-400">Max 20 MB</p>
      </div>

      <Button
        type="button"
        onClick={() => void handleUpload()}
        disabled={uploading || !selectedFile}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>

      {(pendingFiles.length > 0 || docs.length > 0 || loading) && (
        <ul className="space-y-2">
          {pendingFiles.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
            >
              <FileText className="h-4 w-4 text-amber-700" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {item.documentType} · {item.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {item.file.name} · Queued until save
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onPendingChange(pendingFiles.filter((p) => p.id !== item.id))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
          {loading ? (
            <li className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
            </li>
          ) : null}
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {doc.documentType} · {doc.title}
                </p>
                <p className="text-xs text-slate-500">
                  Version {doc.version} · {formatBytes(doc.fileSizeBytes)} ·{" "}
                  {doc.statusLabel ?? doc.status}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleDownload(doc)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleArchive(doc)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!loading && docs.length === 0 && pendingFiles.length === 0 ? (
        <p className="text-xs text-slate-500">
          No technical documents uploaded yet.
        </p>
      ) : null}
    </section>
  );
}
