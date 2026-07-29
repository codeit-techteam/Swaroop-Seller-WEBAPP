"use client";

import { format, parseISO } from "date-fns";
import { Download, FileText, Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { ProfileDocument } from "@/types/profile";

interface DocumentPreviewModalProps {
  open: boolean;
  document: ProfileDocument | null;
  onClose: () => void;
}

export function DocumentPreviewModal({
  open,
  document,
  onClose,
}: DocumentPreviewModalProps) {
  if (!document) return null;

  const handleDownload = () => {
    toast.success(`Downloading ${document.fileName} (mock)`);
    const blob = new Blob(
      [
        `PetroTrade Seller Document\n` +
          `Title: ${document.title}\n` +
          `File: ${document.fileName}\n` +
          `Status: ${document.status}\n` +
          `Expires: ${document.expiryDate}\n`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = document.fileName.replace(/\.[^.]+$/, "") + ".txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {document.title}
          </DialogTitle>
          <DialogDescription>{document.fileName}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="mx-auto flex h-32 w-24 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <FileText className="h-10 w-10 text-[#1B6EF3]" />
            <p className="mt-2 px-2 text-center text-[10px] font-medium text-slate-500">
              PDF Preview
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">
                Status
              </dt>
              <dd className="font-medium capitalize text-slate-800">
                {document.status.replace("_", " ")}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase text-slate-400">
                Expiry
              </dt>
              <dd className="font-medium text-slate-800">
                {format(parseISO(document.expiryDate), "dd MMM yyyy")}
              </dd>
            </div>
          </dl>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="gap-2 bg-[#0B1F3A] hover:bg-[#122846]"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DocumentUploadModalProps {
  open: boolean;
  isUploading: boolean;
  uploadProgress: number;
  onClose: () => void;
  onUpload: (fileName: string) => void;
}

export function DocumentUploadModal({
  open,
  isUploading,
  uploadProgress,
  onClose,
  onUpload,
}: DocumentUploadModalProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      onUpload(file.name);
    },
    [onUpload],
  );

  const {
    getRootProps,
    getInputProps,
    open: openPicker,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !isUploading && onClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a renewed or new certificate. Supported formats: PDF, PNG,
            JPG.
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center"
        >
          <input {...getInputProps()} />
          <Upload className="mb-3 h-10 w-10 text-slate-400" />
          <p className="text-sm text-slate-600">
            Drag & drop your file here, or browse
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isUploading}
            onClick={openPicker}
          >
            Browse Files
          </Button>
        </div>

        {isUploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
