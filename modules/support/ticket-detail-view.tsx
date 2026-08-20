"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { OperationsShell, OpsStatusBadge } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_USER } from "@/config";
import { ROUTES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { useCxOpsStore } from "@/store/cxOpsStore";

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const ticket = useCxOpsStore((s) => s.getTicket(ticketId));
  const addTicketMessage = useCxOpsStore((s) => s.addTicketMessage);
  const setTicketStatus = useCxOpsStore((s) => s.setTicketStatus);
  const [body, setBody] = useState("");

  if (!ticket) {
    return (
      <OperationsShell
        title="Ticket not found"
        subtitle="This support thread is unavailable."
      >
        <Button
          variant="outline"
          onClick={() => router.push(ROUTES.CUSTOMER_SUPPORT)}
        >
          Back to support
        </Button>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell
      title={ticket.ticketId}
      subtitle={`${ticket.customerName} · ${ticket.category} · ${ticket.subject}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              void setTicketStatus(ticket.id, "IN_PROGRESS", CURRENT_USER.name)
            }
          >
            In progress
          </Button>
          <Button
            variant="outline"
            onClick={() => void setTicketStatus(ticket.id, "RESOLVED")}
          >
            Resolve
          </Button>
          <Button
            variant="outline"
            onClick={() => void setTicketStatus(ticket.id, "CLOSED")}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <OpsStatusBadge status={ticket.status} />
        <OpsStatusBadge status={ticket.priority} />
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        {ticket.messages.map((message) => (
          <div key={message.id} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-500">
              {message.actor} · {message.role} · {formatDateTime(message.at)}
            </p>
            <p className="mt-1 text-sm text-slate-800">{message.body}</p>
          </div>
        ))}
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Reply to the customer"
        />
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={async () => {
            if (!body.trim()) {
              toast.error("Message is required");
              return;
            }
            await addTicketMessage(ticket.id, CURRENT_USER.name, body.trim());
            setBody("");
            toast.success("Reply sent");
          }}
        >
          Send reply
        </Button>
      </div>
    </OperationsShell>
  );
}
