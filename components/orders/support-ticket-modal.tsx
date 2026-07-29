"use client";

import { Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  Order,
  SupportIssueType,
  SupportTicketForm,
} from "@/types/orders";
import { SUPPORT_ISSUE_TYPES } from "@/types/orders";

interface SupportTicketModalProps {
  open: boolean;
  order: Order | null;
  form: SupportTicketForm;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<SupportTicketForm>) => void;
  onSubmit: () => void;
}

export function SupportTicketModal({
  open,
  order,
  form,
  onOpenChange,
  onChange,
  onSubmit,
}: SupportTicketModalProps) {
  const { handleSubmit } = useForm({ values: form });

  if (!order) return null;

  const canSubmit =
    Boolean(form.issueType) && form.description.trim().length >= 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Raise Support Ticket</DialogTitle>
          <DialogDescription>
            Submit an issue for{" "}
            <span className="font-semibold text-slate-800">
              {order.orderNumber}
            </span>
            . This is a mock frontend ticket.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(() => {
            if (!canSubmit) return;
            onSubmit();
          })}
        >
          <div className="space-y-2">
            <Label>Issue Type</Label>
            <Select
              value={form.issueType || undefined}
              onValueChange={(v) =>
                onChange({ issueType: v as SupportIssueType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORT_ISSUE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Describe the issue in detail"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachment"
                type="file"
                className="text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  onChange({ attachmentName: file?.name ?? "" });
                }}
              />
              {form.attachmentName ? (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Paperclip className="h-3 w-3" />
                  {form.attachmentName}
                </span>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[#0B1F3A] hover:bg-[#122846]"
            >
              Submit Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
