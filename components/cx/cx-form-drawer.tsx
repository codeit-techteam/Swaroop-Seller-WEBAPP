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
  /** Extra actions on the left of the footer (next to Cancel). */
  footerStart?: ReactNode;
  /** Extra actions on the right of the footer (before Submit). */
  footerEnd?: ReactNode;
  hideSubmit?: boolean;
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
  footerStart,
  footerEnd,
  hideSubmit,
}: CxFormDrawerProps) {
  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      widthClassName={widthClassName}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {footerStart}
          </div>
          <div className="flex items-center gap-2">
            {footerEnd}
            {hideSubmit ? null : (
              <Button
                type="button"
                className="min-w-[140px] bg-[#0B1F3A] hover:bg-[#122846]"
                disabled={submitting}
                onClick={onSubmit}
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">{children}</div>
    </ActionDrawer>
  );
}
