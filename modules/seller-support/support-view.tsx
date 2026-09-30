"use client";

import { Eye, Inbox, Loader2, MessageCircle, Ticket } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageContainer } from "@/components/common/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createSellerSupportTicket,
  listSellerSupportTickets,
  SELLER_TICKET_CATEGORIES,
  type SellerSupportTicket,
  type SellerTicketCategory,
} from "@/services/support";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "Pending",
  WAITING_CUSTOMER: "Pending",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_CLASS: Record<string, string> = {
  Open: "bg-sky-50 text-sky-700 ring-sky-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatRelative(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SellerSupportView() {
  const [tickets, setTickets] = useState<SellerSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);
  const [viewTicket, setViewTicket] = useState<SellerSupportTicket | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState<SellerTicketCategory | "">("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await listSellerSupportTickets());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load tickets",
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial tickets load
    void load();
  }, [load]);

  const recent = useMemo(
    () =>
      [...tickets]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 20),
    [tickets],
  );

  function resetForm() {
    setCategory("");
    setSubject("");
    setDescription("");
    setAttachmentName(undefined);
    setErrors({});
    setSubmitting(false);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!category) next.category = "Select a category";
    const subjectText = subject.trim();
    if (!subjectText) next.subject = "Subject is required";
    else if (subjectText.length < 3)
      next.subject = "Subject must be at least 3 characters";
    else if (subjectText.length > 200)
      next.subject = "Subject must be at most 200 characters";
    const descriptionText = description.trim();
    if (descriptionText.length < 10)
      next.description = "Describe the issue (min 10 characters)";
    else if (descriptionText.length > 5000)
      next.description = "Description must be at most 5000 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !category) return;
    setSubmitting(true);
    try {
      const ticket = await createSellerSupportTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        attachmentName,
      });
      setLastTicketId(ticket.ticketNumber);
      setRaiseOpen(false);
      setSuccessOpen(true);
      resetForm();
      await load();
    } catch (error) {
      setSubmitting(false);
      toast.error(
        error instanceof Error ? error.message : "Could not create ticket",
      );
    }
  }

  return (
    <PageContainer className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Help &amp; Support
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
          Need help with your orders, payments, shipment or account? Our
          PetroTrade support team is here to help.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Chat Support
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Talk to our team
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800"
              onClick={() =>
                toast("Live chat is coming soon. Please raise a ticket.", {
                  icon: "💬",
                })
              }
            >
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Raise Support Ticket
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Submit a request
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800"
              onClick={() => setRaiseOpen(true)}
            >
              Raise Ticket
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          My Recent Tickets
        </h2>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading tickets…
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Inbox className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No tickets yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Raise a ticket above if you need help from our team.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((ticket) => {
                  const label =
                    STATUS_LABEL[ticket.status] ?? String(ticket.status);
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium text-slate-900">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {ticket.categoryLabel}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-slate-700">
                        {ticket.subject}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-500">
                        {formatRelative(ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                            STATUS_CLASS[label] ?? STATUS_CLASS.Open,
                          )}
                        >
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-800"
                          onClick={() => setViewTicket(ticket)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog
        open={raiseOpen}
        onOpenChange={(v) => {
          setRaiseOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Raise Support Ticket</DialogTitle>
            <p className="text-sm text-slate-500">
              Tell us about your issue and we&apos;ll get back to you.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Support Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as SellerTicketCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SELLER_TICKET_CATEGORIES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category ? (
                <p className="text-xs text-red-600">{errors.category}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
              />
              {errors.subject ? (
                <p className="text-xs text-red-600">{errors.subject}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details so our team can help quickly"
              />
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setAttachmentName(e.target.files?.[0]?.name || undefined)
                }
              />
              {attachmentName ? (
                <p className="text-xs text-slate-500">{attachmentName}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRaiseOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {submitting ? "Submitting…" : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket submitted</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Your support request{" "}
            <span className="font-semibold text-slate-900">{lastTicketId}</span>{" "}
            has been submitted. Our support team will contact you shortly.
          </p>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewTicket)}
        onOpenChange={(open) => !open && setViewTicket(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {viewTicket ? (
            <>
              <DialogHeader>
                <DialogTitle>{viewTicket.ticketNumber}</DialogTitle>
              </DialogHeader>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase text-slate-400">Category</dt>
                  <dd className="font-medium">{viewTicket.categoryLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-400">Subject</dt>
                  <dd className="font-medium">{viewTicket.subject}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-400">
                    Description
                  </dt>
                  <dd className="text-slate-700">{viewTicket.description}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-400">Status</dt>
                  <dd>
                    {STATUS_LABEL[viewTicket.status] ?? viewTicket.status}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
