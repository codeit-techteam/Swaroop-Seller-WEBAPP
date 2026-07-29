"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UploadFormData, UploadModalState } from "@/types/documents";
import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
} from "@/types/documents";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const CATEGORIES = Object.entries(DOCUMENT_CATEGORY_LABELS) as [
  DocumentCategory,
  string,
][];

interface UploadModalProps {
  uploadModal: UploadModalState;
  onClose: () => void;
  onFieldChange: <K extends keyof UploadFormData>(
    key: K,
    value: UploadFormData[K],
  ) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => Promise<void>;
}

export function UploadModal({
  uploadModal,
  onClose,
  onFieldChange,
  onFileChange,
  onSubmit,
}: UploadModalProps) {
  const { open, mode, form, file, errors, isUploading, uploadProgress } =
    uploadModal;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const title =
    mode === "new"
      ? "Upload New Document"
      : mode === "renew"
        ? "Renew Document"
        : "Replace Document";

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onFileChange(null);
  }, [previewUrl, onFileChange]);

  const handleClose = () => {
    if (isUploading) return;
    clearFile();
    onClose();
  };

  const onDrop = useCallback(
    (accepted: File[], rejected: unknown[]) => {
      if (rejected.length > 0) return;
      const next = accepted[0];
      if (!next) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      onFileChange(next);
      setPreviewUrl(
        next.type.startsWith("image/") ? URL.createObjectURL(next) : null,
      );
    },
    [previewUrl, onFileChange],
  );

  const {
    getRootProps,
    getInputProps,
    open: openPicker,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: Boolean(file),
    disabled: isUploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "new"
              ? "Add a new compliance, quality, or transactional record."
              : "Upload an updated file for this document."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          {mode === "new" ? (
            <>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    onFieldChange("category", v as DocumentCategory)
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category ? (
                  <p className="text-xs text-red-600">{errors.category}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-name">Document Name</Label>
                <Input
                  id="doc-name"
                  value={form.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="e.g. GST Certificate"
                />
                {errors.name ? (
                  <p className="text-xs text-red-600">{errors.name}</p>
                ) : null}
              </div>
            </>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="doc-version">Version</Label>
              <Input
                id="doc-version"
                value={form.version}
                onChange={(e) => onFieldChange("version", e.target.value)}
                className={errors.version ? "border-red-500" : ""}
                placeholder="v1.0"
              />
              {errors.version ? (
                <p className="text-xs text-red-600">{errors.version}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-expiry">Expiry</Label>
              <Input
                id="doc-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => onFieldChange("expiryDate", e.target.value)}
                className={errors.expiryDate ? "border-red-500" : ""}
              />
              {errors.expiryDate ? (
                <p className="text-xs text-red-600">{errors.expiryDate}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Upload File</Label>
            <div
              {...getRootProps()}
              className={cn(
                "rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                dragActive
                  ? "border-[#1B6EF3] bg-[#E8F1FF]"
                  : errors.file
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-slate-50",
                isUploading && "pointer-events-none opacity-60",
              )}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="h-5 w-5 text-[#1B6EF3]" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      Drag & drop or browse
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, PNG, JPEG, DOCX · Max 10MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPicker();
                      }}
                    >
                      Browse File
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-20 w-auto rounded border border-slate-200 object-cover"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-slate-500" />
                    )}
                    <p className="text-sm font-medium text-slate-800">
                      {file.name}
                    </p>
                    {!isUploading ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.file ? (
              <p className="text-xs text-red-600">{errors.file}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-remarks">Remarks</Label>
            <Textarea
              id="doc-remarks"
              value={form.remarks}
              onChange={(e) => onFieldChange("remarks", e.target.value)}
              placeholder="Optional notes…"
              rows={2}
            />
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
          <Button
            className="bg-[#0B1F3A] hover:bg-[#122846]"
            disabled={isUploading}
            onClick={() => onSubmit()}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {mode === "new" ? "Upload Document" : "Submit"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
