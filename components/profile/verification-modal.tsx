"use client";

import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VerificationForm } from "@/types/profile";

interface VerificationModalProps {
  open: boolean;
  form: VerificationForm;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<VerificationForm>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function VerificationModal({
  open,
  form,
  isSaving,
  onOpenChange,
  onChange,
  onSubmit,
  onCancel,
}: VerificationModalProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Request Re-verification
          </DialogTitle>
          <DialogDescription>
            Submit a re-verification request when your business details or
            documents have changed. Our compliance team will review within 2–3
            business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Re-verification</Label>
            <Textarea
              id="reason"
              rows={4}
              placeholder="Describe what has changed and why re-verification is needed..."
              value={form.reason}
              onChange={(e) => onChange({ reason: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0B1F3A] hover:bg-[#122846]"
              disabled={isSaving || !form.reason.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
