"use client";

import { CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function SuccessDialog({ open, message, onClose }: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <DialogTitle>Success</DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
