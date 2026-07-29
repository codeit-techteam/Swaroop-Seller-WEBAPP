"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ComplianceDocument, FastTrackReason } from "@/types/compliance";
import { FAST_TRACK_REASONS } from "@/types/compliance";

const schema = z.object({
  reason: z.enum([
    "trading_deadline",
    "tier_renewal",
    "audit_requirement",
    "buyer_onboarding",
    "other",
  ]),
  comment: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(500, "Comment is too long"),
});

type FormValues = z.infer<typeof schema>;

interface FastTrackModalProps {
  open: boolean;
  document: ComplianceDocument | null;
  onClose: () => void;
  onSubmit: (reason: FastTrackReason, comment: string) => void;
}

export function FastTrackModal({
  open,
  document,
  onClose,
  onSubmit,
}: FastTrackModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "trading_deadline",
      comment: "",
    },
  });

  const handleClose = () => {
    if (submitting) return;
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmit(values.reason, values.comment);
    setSubmitting(false);
    form.reset();
    toast.success("Request Submitted Successfully");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Fast-Track Verification</DialogTitle>
          <DialogDescription>
            {document
              ? `Escalate review for ${document.name}. Admin will prioritize verification.`
              : "Escalate document verification."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FAST_TRACK_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Describe why verification needs to be expedited..."
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#1B6EF3] hover:bg-[#1558C8]"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
