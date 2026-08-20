"use client";

import type { ReactNode } from "react";

import { ActionDrawer } from "@/components/erp";
import { Button } from "@/components/ui/button";

interface CxFormDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  widthClassName?: string;
}

export function CxFormDrawer({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  submitting,
  widthClassName = "w-full max-w-xl",
}: CxFormDrawerProps) {
  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      widthClassName={widthClassName}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="min-w-[140px] bg-[#0B1F3A] hover:bg-[#122846]"
            disabled={submitting}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">{children}</div>
    </ActionDrawer>
  );
}
