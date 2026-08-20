"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  reasonRequired?: boolean;
  reason?: string;
  onReasonChange?: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  reasonRequired,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) {
  const blocked = Boolean(reasonRequired && !reason?.trim());

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {reasonRequired ? (
          <Textarea
            value={reason}
            onChange={(event) => onReasonChange?.(event.target.value)}
            placeholder="Enter reason"
            className="min-h-24"
          />
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#0B1F3A] hover:bg-[#122846]"
            }
            disabled={blocked}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
