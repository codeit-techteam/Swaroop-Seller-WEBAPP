"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect } from "react";

import { DispatchInstructionCard } from "@/components/orders/dispatch-instruction-card";
import { DocumentCard } from "@/components/orders/document-card";
import { OrderFlowPanel } from "@/components/orders/order-flow-panel";
import { PaymentDetailsCard } from "@/components/orders/payment-details-card";
import { SettlementCard } from "@/components/orders/settlement-card";
import { Timeline } from "@/components/orders/timeline";
import { TrackingTimelineCard } from "@/components/orders/tracking-timeline-card";
import { TransportCard } from "@/components/orders/transport-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/orders";

interface OrderDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: () => void;
  onSupportTicket: () => void;
  onManageFlow: () => void;
  onVerifyPayment: () => void;
  onDownloadDocument: (documentId: string) => void;
  onViewCoa: () => void;
  className?: string;
}

export function OrderDrawer({
  open,
  order,
  onClose,
  onUpdateStatus,
  onSupportTicket,
  onManageFlow,
  onVerifyPayment,
  onDownloadDocument,
  onViewCoa,
  className,
}: OrderDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && order ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30 lg:bg-transparent lg:pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {order.orderNumber}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {order.productGrade} | {order.quantityMt.toFixed(0)} MT
                </p>
                {order.customerRequestId ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Customer request {order.customerRequestId}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <OrderFlowPanel
                order={order}
                onPrimaryAction={onManageFlow}
                className="shadow-none"
              />
              <Timeline steps={order.timeline} />
              <PaymentDetailsCard
                order={order}
                onVerify={onVerifyPayment}
                className="shadow-none"
              />
              <TrackingTimelineCard order={order} className="shadow-none" />
              <DocumentCard
                documents={order.documents}
                gradeSpecs={order.gradeSpecs}
                onDownload={onDownloadDocument}
                onViewCoa={onViewCoa}
              />
              <DispatchInstructionCard
                instruction={order.dispatchInstructions}
              />
              <TransportCard transport={order.transport} />
              <SettlementCard status={order.settlementStatus} />
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 py-4">
              <Button
                className="h-11 w-full bg-[#0B1F3A] text-sm font-bold uppercase tracking-wide hover:bg-[#122846]"
                asChild
              >
                <Link href={`${ROUTES.ORDERS}/${order.id}`}>
                  Open Full Manage Screen
                </Link>
              </Button>
              <Button
                className="h-11 w-full bg-[#1B6EF3] text-sm font-bold uppercase tracking-wide hover:bg-[#1558C8]"
                onClick={onUpdateStatus}
              >
                Update Order Status
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full border-slate-200 text-sm font-bold uppercase tracking-wide"
                onClick={onSupportTicket}
              >
                Support Ticket
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
