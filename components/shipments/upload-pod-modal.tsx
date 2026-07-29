"use client";

import { FileText, Trash2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Shipment, UploadPodFormData } from "@/types/shipments";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

interface UploadPODModalProps {
  open: boolean;
  shipment: Shipment | null;
  form: UploadPodFormData;
  onFormChange: (data: Partial<UploadPodFormData>) => void;
  onOpenChange: (open: boolean) => void;
  onUpload: () => void;
}

export function UploadPODModal({
  open,
  shipment,
  form,
  onFormChange,
  onOpenChange,
  onUpload,
}: UploadPODModalProps) {
  const [dragActive, setDragActive] = useState(false);

  const clearFile = useCallback(() => {
    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    onFormChange({ file: null, previewUrl: null });
  }, [form.previewUrl, onFormChange]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      onFormChange({ file, previewUrl });
      setDragActive(false);
    },
    [form.previewUrl, onFormChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleClose = (next: boolean) => {
    if (!next) clearFile();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Proof of Delivery</DialogTitle>
          <DialogDescription>
            Upload POD for {shipment?.shipmentId ?? "shipment"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!form.file ? (
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                isDragActive || dragActive
                  ? "border-[#1B6EF3] bg-[#E8F1FF]/50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300",
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Drag & drop or click to upload
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PDF, PNG, or JPG (max 10 MB)
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 p-4">
              {form.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.previewUrl}
                  alt="POD preview"
                  className="mx-auto max-h-40 rounded-lg object-contain"
                />
              ) : (
                <div className="flex flex-col items-center py-4">
                  <FileText className="h-12 w-12 text-red-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {form.file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(form.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
              <div className="mt-3 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600"
                  onClick={clearFile}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            disabled={!form.file}
            className="bg-[#0B1F3A] hover:bg-[#16345A]"
            onClick={onUpload}
          >
            Upload POD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
