"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import {
  AcceptOrderModal,
  OrderStatusBadge,
  RejectOrderModal,
  Timeline,
} from "@/components/orders";
import {
  FinancialOverviewCard,
  PaymentRiskCard,
  ProductSpecCard,
  RegistrationBillingCard,
} from "@/components/orders/order-detail-cards";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useOrdersStore } from "@/store/ordersStore";

export function OrderDetailView() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const dialogType = useOrdersStore((s) => s.dialogType);
  const dialogOrderId = useOrdersStore((s) => s.dialogOrderId);
  const acceptForm = useOrdersStore((s) => s.acceptForm);
  const rejectForm = useOrdersStore((s) => s.rejectForm);
  const openDialog = useOrdersStore((s) => s.openDialog);
  const closeDialog = useOrdersStore((s) => s.closeDialog);
  const setAcceptForm = useOrdersStore((s) => s.setAcceptForm);
  const setRejectForm = useOrdersStore((s) => s.setRejectForm);
  const acceptOrder = useOrdersStore((s) => s.acceptOrder);
  const rejectOrder = useOrdersStore((s) => s.rejectOrder);
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

  const handleAccept = () => {
    acceptOrder(order.id);
    toast.success("Proforma Invoice Generated");
  };

  const handleReject = () => {
    rejectOrder(order.id);
    toast.success("Order Rejected");
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

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RegistrationBillingCard order={order} />
          <ProductSpecCard order={order} />
        </motion.div>

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <FinancialOverviewCard order={order} />
          <PaymentRiskCard order={order} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <Timeline steps={order.detailTimeline} title="Order Timeline" />
        </motion.div>
      </div>

      {canAcceptReject ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
            <div className="flex items-start gap-2 text-sm text-amber-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Reviewing this order will trigger a Proforma Invoice generation
                upon acceptance.
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
    </div>
  );
}
