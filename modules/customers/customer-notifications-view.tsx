"use client";

import { useState } from "react";
import { useMemo } from "react";
import toast from "react-hot-toast";

import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useClientTable } from "@/hooks/useClientTable";
import { useCustomerStore } from "@/store/customerStore";
import { useCxOpsStore } from "@/store/cxOpsStore";
import type {
  CustomerNotification,
  NotificationChannel,
  NotificationTarget,
} from "@/types/cx-ops";

export function CustomerNotificationsView() {
  const notifications = useCxOpsStore((s) => s.notifications);
  const sendNotification = useCxOpsStore((s) => s.sendNotification);
  const customers = useCustomerStore((s) => s.customers);
  const segments = useCustomerStore((s) => s.segments);
  const [title, setTitle] = useState("New Bulk Offer Available");
  const [message, setMessage] = useState(
    "A new institutional offer is live on the marketplace.",
  );
  const [cta, setCta] = useState("View Offer");
  const [target, setTarget] = useState<NotificationTarget>("ALL");
  const [targetValue, setTargetValue] = useState("");
  const searchFields = useMemo(
    () => (row: CustomerNotification) => [row.title, row.message, row.cta],
    [],
  );
  const table = useClientTable({
    rows: notifications,
    searchFields,
    getStatus: (row) => row.status,
  });

  return (
    <OperationsShell
      title="Customer notifications"
      subtitle="Push, email, SMS and in-app messages to Customer APP/WEB audiences."
    >
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (title.trim().length < 3 || message.trim().length < 5) {
              toast.error("Title and message are required");
              return;
            }
            const channels: NotificationChannel[] = ["PUSH", "IN_APP"];
            await sendNotification({
              title: title.trim(),
              message: message.trim(),
              cta,
              targetScreen: "/offers",
              channels,
              target,
              targetValue: targetValue || undefined,
              status: "SENT",
              sentAt: new Date().toISOString(),
            });
            toast.success("Notification queued to the selected audience");
          }}
        >
          <h2 className="text-sm font-semibold text-slate-900">Compose</h2>
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>CTA</Label>
            <Input
              value={cta}
              onChange={(event) => setCta(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Target</Label>
            <Select
              value={target}
              onValueChange={(value) => setTarget(value as NotificationTarget)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All customers</SelectItem>
                <SelectItem value="CUSTOMER_TYPE">Customer type</SelectItem>
                <SelectItem value="SPECIFIC">Specific customer</SelectItem>
                <SelectItem value="ACTIVE_ORDERS">Active orders</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pending payment</SelectItem>
                <SelectItem value="PENDING_PR">Pending PR</SelectItem>
                <SelectItem value="CITY">City</SelectItem>
                <SelectItem value="SEGMENT">Segment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {target === "SPECIFIC" ? (
            <Select value={targetValue} onValueChange={setTargetValue}>
              <SelectTrigger>
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {target === "SEGMENT" ? (
            <Select value={targetValue} onValueChange={setTargetValue}>
              <SelectTrigger>
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {target === "CITY" || target === "CUSTOMER_TYPE" ? (
            <Input
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              placeholder={
                target === "CITY" ? "City" : "INDIVIDUAL / BUILDER / ..."
              }
            />
          ) : null}
          <Button
            type="submit"
            className="w-full bg-[#1B6EF3] hover:bg-[#1558C8]"
          >
            Send notification
          </Button>
        </form>

        <OpsTable
          search={table.search}
          onSearch={table.setSearch}
          searchPlaceholder="Search sent notifications"
          status={table.status}
          onStatusChange={table.setStatus}
          statusOptions={["ALL", "DRAFT", "SCHEDULED", "SENT", "FAILED"]}
          headers={["Title", "Target", "CTA", "Status"]}
          emptyTitle="No notifications"
          emptyDescription="Send the first customer notification."
          page={table.page}
          totalPages={table.totalPages}
          totalItems={table.filtered.length}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          rowCount={table.paginated.length}
        >
          {table.paginated.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-slate-400">{row.message}</p>
              </TableCell>
              <TableCell>
                {row.target}
                {row.targetValue ? ` · ${row.targetValue}` : ""}
              </TableCell>
              <TableCell>{row.cta}</TableCell>
              <TableCell>
                <OpsStatusBadge status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </OpsTable>
      </div>
    </OperationsShell>
  );
}
