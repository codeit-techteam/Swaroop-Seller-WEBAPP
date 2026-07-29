"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ComplianceDocument } from "@/types/compliance";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

interface UploadDocumentModalProps {
  open: boolean;
  document: ComplianceDocument | null;
  isUploading: boolean;
  uploadProgress: number;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function UploadDocumentModal({
  open,
  document,
  isUploading,
  uploadProgress,
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleClose = () => {
    if (isUploading) return;
    clearFile();
    onClose();
  };

  const onDrop = useCallback(
    (accepted: File[], rejected: unknown[]) => {
      if (rejected.length > 0) {
        toast.error("Invalid file. Use PDF, PNG, JPEG, or DOCX under 10MB.");
        return;
      }
      const next = accepted[0];
      if (!next) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(next);
      setPreviewUrl(
        next.type.startsWith("image/") ? URL.createObjectURL(next) : null,
      );
    },
    [previewUrl],
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

  const handleSubmit = async () => {
    if (!file || !document) return;
    await onUpload(file);
    clearFile();
    toast.success("Document uploaded successfully");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle>Upload New Version</DialogTitle>
          <DialogDescription>
            {document
              ? `Replace current file for ${document.name} (${document.documentNumber}).`
              : "Upload a compliance document."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div
            {...getRootProps()}
            className={cn(
              "rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragActive
                ? "border-[#1B6EF3] bg-[#E8F1FF]"
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <Upload className="h-5 w-5 text-[#1B6EF3]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, PNG, JPEG, DOCX · Max 10MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(event) => {
                      event.stopPropagation();
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
                  className="flex flex-col items-center gap-3"
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Upload preview"
                      className="h-28 w-auto rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-sm">
                      <FileText className="h-7 w-7 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {!isUploading ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openPicker();
                        }}
                      >
                        Replace File
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearFile();
                        }}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
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
            disabled={!file || isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
