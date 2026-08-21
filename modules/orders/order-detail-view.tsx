"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import {
  AcceptOrderModal,
  AssignTransportModal,
  MarkDeliveredModal,
  OrderFlowPanel,
  OrderStatusBadge,
  PaymentDetailsCard,
  RejectOrderModal,
  Timeline,
  TrackingTimelineCard,
  VerifyPaymentModal,
} from "@/components/orders";
import {
  FinancialOverviewCard,
  PaymentRiskCard,
  ProductSpecCard,
  RegistrationBillingCard,
} from "@/components/orders/order-detail-cards";
import { SettlementCard } from "@/components/orders/settlement-card";
import { TransportCard } from "@/components/orders/transport-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useOrdersStore } from "@/store/ordersStore";
import { getNextFlowAction } from "@/types/orders";

export function OrderDetailView() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const dialogType = useOrdersStore((s) => s.dialogType);
  const dialogOrderId = useOrdersStore((s) => s.dialogOrderId);
  const acceptForm = useOrdersStore((s) => s.acceptForm);
  const rejectForm = useOrdersStore((s) => s.rejectForm);
  const verifyPaymentForm = useOrdersStore((s) => s.verifyPaymentForm);
  const assignTransportForm = useOrdersStore((s) => s.assignTransportForm);
  const markDeliveredForm = useOrdersStore((s) => s.markDeliveredForm);
  const openDialog = useOrdersStore((s) => s.openDialog);
  const closeDialog = useOrdersStore((s) => s.closeDialog);
  const setAcceptForm = useOrdersStore((s) => s.setAcceptForm);
  const setRejectForm = useOrdersStore((s) => s.setRejectForm);
  const setVerifyPaymentForm = useOrdersStore((s) => s.setVerifyPaymentForm);
  const setAssignTransportForm = useOrdersStore(
    (s) => s.setAssignTransportForm,
  );
  const setMarkDeliveredForm = useOrdersStore((s) => s.setMarkDeliveredForm);
  const acceptOrder = useOrdersStore((s) => s.acceptOrder);
  const rejectOrder = useOrdersStore((s) => s.rejectOrder);
  const verifyPayment = useOrdersStore((s) => s.verifyPayment);
  const startProcessing = useOrdersStore((s) => s.startProcessing);
  const markDispatchReady = useOrdersStore((s) => s.markDispatchReady);
  const assignTransport = useOrdersStore((s) => s.assignTransport);
  const markInTransit = useOrdersStore((s) => s.markInTransit);
  const markDelivered = useOrdersStore((s) => s.markDelivered);
  const getOrderById = useOrdersStore((s) => s.getOrderById);

  const order = getOrderById(orderId);
  const dialogOrder = dialogOrderId
    ? (getOrderById(dialogOrderId) ?? null)
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6">
        <Button variant="ghost" className="gap-2 px-0 text-slate-600" asChild>
          <Link href={ROUTES.ORDERS}>
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Order not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            No order matches id{" "}
            <span className="font-mono text-slate-700">{orderId}</span>.
          </p>
          <Button className="mt-6 bg-[#0B1F3A] hover:bg-[#122846]" asChild>
            <Link href={ROUTES.ORDERS}>View All Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const submittedLabel = new Date(order.submittedAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const canAcceptReject = order.status === "new";
  const next = getNextFlowAction(order);

  const handleFlowAction = () => {
    switch (next.action) {
      case "accept":
        openDialog("accept", order.id);
        break;
      case "verify_payment":
        openDialog("verify_payment", order.id);
        break;
      case "start_processing": {
        const result = startProcessing(order.id);
        if (result.ok) toast.success("Order moved to Processing");
        else toast.error(result.error ?? "Unable to start processing");
        break;
      }
      case "mark_dispatch_ready": {
        const result = markDispatchReady(order.id);
        if (result.ok) toast.success("Marked Dispatch Ready");
        else toast.error(result.error ?? "Unable to update");
        break;
      }
      case "assign_transport":
        openDialog("assign_transport", order.id);
        break;
      case "mark_in_transit": {
        const result = markInTransit(order.id);
        if (result.ok) toast.success("Order is In Transit");
        else toast.error(result.error ?? "Assign transport first");
        break;
      }
      case "mark_delivered":
        openDialog("mark_delivered", order.id);
        break;
      default:
        break;
    }
  };

  const handleAccept = () => {
    acceptOrder(order.id);
    toast.success("Proforma Invoice Generated");
  };

  const handleReject = () => {
    rejectOrder(order.id);
    toast.success("Order Rejected");
  };

  const handleVerifyPayment = () => {
    const result = verifyPayment(order.id);
    if (result.ok) toast.success("Payment verified");
    else toast.error(result.error ?? "Verification failed");
  };

  const handleAssignTransport = () => {
    const result = assignTransport(order.id);
    if (result.ok) toast.success("Transport assigned");
    else toast.error(result.error ?? "Assignment failed");
  };

  const handleMarkDelivered = () => {
    const result = markDelivered(order.id);
    if (result.ok) toast.success("Order delivered successfully");
    else toast.error(result.error ?? "Delivery confirmation failed");
  };

  return (
    <div className="relative mx-auto max-w-[1400px] space-y-5 px-4 pb-28 pt-6 md:px-6">
      <Button variant="ghost" className="gap-2 px-0 text-slate-600" asChild>
        <Link href={ROUTES.ORDERS}>
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Order #{order.orderNumber.replace(/^ORD-/, "ORD-")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submitted on {submittedLabel}
            {order.customerRequestId
              ? ` · Customer request ${order.customerRequestId}`
              : ""}
          </p>
        </div>
        <OrderStatusBadge
          status={order.status}
          detailLabel
          className={
            order.status === "new"
              ? "border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
              : undefined
          }
        />
      </div>

      <OrderFlowPanel
        order={order}
        onPrimaryAction={handleFlowAction}
        onReject={() => openDialog("reject", order.id)}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RegistrationBillingCard order={order} />
          <ProductSpecCard order={order} />
          <PaymentDetailsCard
            order={order}
            onVerify={() => openDialog("verify_payment", order.id)}
          />
        </motion.div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <FinancialOverviewCard order={order} />
          <PaymentRiskCard order={order} />
          <TransportCard transport={order.transport} />
          <SettlementCard status={order.settlementStatus} />
        </motion.div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Timeline steps={order.detailTimeline} title="Order Timeline" />
          </div>
          <TrackingTimelineCard order={order} />
        </motion.div>
      </div>

      {canAcceptReject ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
            <div className="flex items-start gap-2 text-sm text-amber-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Reviewing this customer order will trigger a Proforma Invoice on
                acceptance. Payment terms: {order.paymentLabel}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="h-11 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => openDialog("reject", order.id)}
              >
                Reject Order
              </Button>
              <Button
                className="h-11 gap-2 bg-teal-700 hover:bg-teal-800"
                onClick={() => openDialog("accept", order.id)}
              >
                Accept Order & Generate PI
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <AcceptOrderModal
        open={dialogType === "accept"}
        order={dialogOrder}
        form={acceptForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setAcceptForm}
        onConfirm={handleAccept}
      />

      <RejectOrderModal
        open={dialogType === "reject"}
        order={dialogOrder}
        form={rejectForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setRejectForm}
        onConfirm={handleReject}
      />

      <VerifyPaymentModal
        open={dialogType === "verify_payment"}
        order={dialogOrder}
        form={verifyPaymentForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setVerifyPaymentForm}
        onSubmit={handleVerifyPayment}
      />

      <AssignTransportModal
        open={dialogType === "assign_transport"}
        order={dialogOrder}
        form={assignTransportForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setAssignTransportForm}
        onSubmit={handleAssignTransport}
      />

      <MarkDeliveredModal
        open={dialogType === "mark_delivered"}
        order={dialogOrder}
        form={markDeliveredForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setMarkDeliveredForm}
        onSubmit={handleMarkDelivered}
      />
    </div>
  );
}
