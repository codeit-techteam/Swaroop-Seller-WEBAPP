"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { ProgressBar } from "@/components/marketplace/progress-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductUpload } from "@/types/products";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

function UploadIcon({
  type,
  className,
}: {
  type: ProductUpload["type"];
  className?: string;
}) {
  switch (type) {
    case "image":
      return <ImageIcon className={className} />;
    case "tds":
      return <FileText className={className} />;
    case "coa":
      return <Award className={className} />;
  }
}

interface UploadBoxProps {
  upload: ProductUpload;
  onUpload: (file: File) => void;
  onReplace: (file: File) => void;
  onRemove: () => void;
  onCancel?: () => void;
  className?: string;
}

export function UploadBox({
  upload,
  onUpload,
  onReplace,
  onRemove,
  onCancel,
  className,
}: UploadBoxProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const maxSize = upload.type === "image" ? MAX_IMAGE_SIZE : MAX_PDF_SIZE;

  const IMAGE_ACCEPT = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
  } as const;

  const PDF_ACCEPT = {
    "application/pdf": [".pdf"],
  } as const;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (upload.status === "empty" || upload.status === "error") {
        onUpload(file);
      } else {
        onReplace(file);
      }
    },
    [upload.status, onUpload, onReplace],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: upload.type === "image" ? IMAGE_ACCEPT : PDF_ACCEPT,
    maxSize,
    multiple: false,
    noClick: upload.status !== "empty" && upload.status !== "error",
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const isEmpty = upload.status === "empty" || upload.status === "error";
  const isUploading = upload.status === "uploading";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex min-h-[140px] flex-col rounded-xl border border-dashed border-slate-200 bg-white p-4 transition-colors",
        isDragActive && "border-[#1B6EF3] bg-blue-50/50",
        upload.status === "error" && "border-red-300 bg-red-50/30",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <div
            {...getRootProps()}
            className="flex flex-1 cursor-pointer flex-col items-center justify-center text-center"
          >
            <input {...getInputProps()} />
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <UploadIcon
                type={upload.type}
                className="h-5 w-5 text-slate-500"
              />
            </div>
            <p className="text-sm font-medium text-slate-700">{upload.label}</p>
            <p className="mt-1 text-xs text-slate-400">{upload.description}</p>
            {upload.errorMessage ? (
              <p className="mt-2 text-xs text-red-500">{upload.errorMessage}</p>
            ) : null}
          </div>
        ) : isUploading ? (
          <div className="flex flex-1 flex-col justify-center space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#1B6EF3]" />
              <p className="truncate text-sm font-medium">{upload.fileName}</p>
            </div>
            <ProgressBar value={upload.uploadProgress ?? 0} />
            {onCancel ? (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex items-start gap-3">
              {upload.previewUrl && upload.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={upload.previewUrl}
                  alt={upload.label}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <UploadIcon
                    type={upload.type}
                    className="h-5 w-5 text-slate-500"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {upload.fileName}
                </p>
                <p className="text-xs text-slate-400">
                  {upload.fileSize
                    ? upload.fileSize < 1024 * 1024
                      ? `${(upload.fileSize / 1024).toFixed(1)} KB`
                      : `${(upload.fileSize / (1024 * 1024)).toFixed(1)} MB`
                    : ""}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={open} type="button">
                <Upload className="mr-1 h-3 w-3" />
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                type="button"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { UploadBox as FileUploader };
