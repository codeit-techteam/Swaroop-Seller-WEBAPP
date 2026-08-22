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
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {footerStart}
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {footerEnd}
            {hideSubmit ? null : (
              <Button
                type="button"
                className="shrink-0 bg-[#0B1F3A] hover:bg-[#122846] sm:min-w-[132px]"
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
