"use client";

import { format, parseISO } from "date-fns";
import {
  Archive,
  CheckCheck,
  Copy,
  Download,
  Mail,
  Pin,
  Share2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { ActionDrawer } from "@/components/erp/action-drawer";
import { Timeline } from "@/components/erp/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notifications";

interface NotificationDrawerProps {
  open: boolean;
  notification: Notification | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onPin: (id: string) => void;
}

export function NotificationDrawer({
  open,
  notification,
  onClose,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onArchive,
  onPin,
}: NotificationDrawerProps) {
  if (!notification) return null;

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(notification.referenceNumber);
      toast.success("Reference copied to clipboard");
    } catch {
      toast.error("Unable to copy reference");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: notification.title,
      text: `${notification.description}\nRef: ${notification.referenceNumber}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fall through */
      }
    }
    toast.success("Share link copied (mock)");
  };

  const footer = (
    <div className="flex flex-wrap gap-2">
      {notification.read ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            onMarkUnread(notification.id);
            toast.success("Marked as unread");
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          Mark Unread
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            onMarkRead(notification.id);
            toast.success("Marked as read");
          }}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark Read
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          onPin(notification.id);
          toast.success(
            notification.pinned
              ? "Notification unpinned"
              : "Notification pinned",
          );
        }}
      >
        <Pin className="h-3.5 w-3.5" />
        {notification.pinned ? "Unpin" : "Pin"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleShare}
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleCopyReference}
      >
        <Copy className="h-3.5 w-3.5" />
        Copy Ref
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          onArchive(notification.id);
          toast.success("Notification archived");
          onClose();
        }}
      >
        <Archive className="h-3.5 w-3.5" />
        Archive
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-red-600 hover:text-red-700"
        onClick={() => {
          onDelete(notification.id);
          toast.success("Notification deleted");
          onClose();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </div>
  );

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      title="Notification Details"
      widthClassName="w-full max-w-lg"
      footer={footer}
    >
      <div className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-semibold">
              {notification.category}
            </Badge>
            <Badge
              className={cn(
                "text-[10px] font-bold uppercase",
                notification.priority === "Critical" ||
                  notification.priority === "Urgent"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-700",
              )}
            >
              {notification.priority}
            </Badge>
            {!notification.read ? (
              <Badge className="bg-[#1B6EF3] text-[10px] text-white">
                Unread
              </Badge>
            ) : null}
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            {notification.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {notification.description}
          </p>
          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p>
              Reference:{" "}
              <span className="font-semibold text-slate-700">
                {notification.referenceNumber}
              </span>
            </p>
            {notification.referenceLabel ? (
              <p>Label: {notification.referenceLabel}</p>
            ) : null}
            <p>
              Received:{" "}
              {format(parseISO(notification.createdAt), "MMM d, yyyy · h:mm a")}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Timeline
          </h4>
          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <Timeline
              items={notification.timeline.map((event) => ({
                id: event.id,
                title: event.title,
                description: event.description,
                time: format(parseISO(event.timestamp), "MMM d, h:mm a"),
                status: event.status,
              }))}
            />
          </div>
        </div>

        {notification.attachments.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Attachments
            </h4>
            <div className="mt-3 space-y-2">
              {notification.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {attachment.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {attachment.type} · {attachment.size}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      toast.success(`Downloading ${attachment.name} (mock)`)
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {notification.relatedOrder ? (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Related Order
            </h4>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-semibold text-slate-800">
                    {notification.relatedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Product</span>
                  <span className="font-medium text-slate-800">
                    {notification.relatedOrder.product}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Quantity</span>
                  <span className="font-medium text-slate-800">
                    {notification.relatedOrder.quantity}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Status</span>
                  <Badge variant="outline">
                    {notification.relatedOrder.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ActionDrawer>
  );
}
