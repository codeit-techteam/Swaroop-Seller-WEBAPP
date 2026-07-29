"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { VerificationStatusBadge } from "@/components/onboarding/verification-status";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DocumentItem, DocumentStatus } from "@/types/onboarding";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

interface UploadCardProps {
  document: DocumentItem;
  onUpload: (file: File) => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
  onCancel?: () => void;
  className?: string;
}

function getStatusBadge(status: DocumentStatus) {
  switch (status) {
    case "verified":
      return <VerificationStatusBadge status="verified" />;
    case "pending_review":
      return <VerificationStatusBadge status="pending" />;
    case "rejected":
      return <VerificationStatusBadge status="rejected" />;
    case "uploading":
      return <VerificationStatusBadge status="loading" label="Uploading" />;
    case "uploaded":
      return <VerificationStatusBadge status="verified" label="Uploaded" />;
    default:
      return null;
  }
}

export function UploadCard({
  document,
  onUpload,
  onReplace,
  onDelete,
  onCancel,
  className,
}: UploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (document.status === "empty" || document.status === "rejected") {
        onUpload(file);
      } else {
        onReplace(file);
      }
    },
    [document.status, onUpload, onReplace],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: document.status !== "empty" && document.status !== "rejected",
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
  });

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isEmpty = document.status === "empty";
  const isUploading = document.status === "uploading";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-card shadow-card",
        document.status === "rejected" && "border-destructive/40",
        document.status === "verified" && "border-success/30",
        className,
      )}
    >
      <div className="flex items-start justify-between border-b px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">{document.name}</h3>
            {document.required ? (
              <span className="text-xs text-destructive">*</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {document.description}
          </p>
        </div>
        {getStatusBadge(document.status)}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
              )}
            >
              <input {...getInputProps()} />
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Browse or Drag Files</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, PNG, JPG — Max 10MB
              </p>
            </div>
          ) : isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{document.fileName}</p>
                  <Progress
                    value={document.uploadProgress ?? 0}
                    className="mt-2 h-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.uploadProgress ?? 0}% uploaded
                  </p>
                </div>
              </div>
              {onCancel ? (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {document.status === "rejected" && document.errorMessage ? (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {document.errorMessage}
                </div>
              ) : null}

              <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                {document.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={document.previewUrl}
                    alt={document.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {document.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(document.fileSize)}
                    {document.uploadedAt
                      ? ` • ${new Date(document.uploadedAt).toLocaleDateString()}`
                      : null}
                  </p>
                </div>
                {document.status === "verified" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : document.status === "pending_review" ? (
                  <Clock className="h-5 w-5 text-warning" />
                ) : null}
              </div>

              <div className="flex gap-2">
                {document.previewUrl ? (
                  <Button variant="outline" size="sm" type="button">
                    <Eye className="h-4 w-4" />
                    View File
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={open}
                  type="button"
                >
                  Replace
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  type="button"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">{progress}% complete</p>
    </div>
  );
}
