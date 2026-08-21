"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { LoadingOverlay } from "@/components/marketplace/loading-overlay";
import {
  AcceptOrderModal,
  AssignTransportModal,
  MarkDeliveredModal,
  OrderDrawer,
  OrdersSummaryCards,
  OrdersTable,
  OrdersTabs,
  RejectOrderModal,
  SearchBar,
  SupportTicketModal,
  TopFilters,
  UpdateStatusModal,
  VerifyPaymentModal,
} from "@/components/orders";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useOrdersStore } from "@/store/ordersStore";
import type { Order } from "@/types/orders";
import { getNextFlowAction } from "@/types/orders";

export function OrdersView() {
  const router = useRouter();

  useEffect(() => {
    useOrdersStore.setState({ isLoading: true, hasError: false });
    const timer = window.setTimeout(() => {
      useOrdersStore.setState({ isLoading: false });
    }, 550);
    return () => window.clearTimeout(timer);
  }, []);

  const filters = useOrdersStore((s) => s.filters);
  const activeTab = useOrdersStore((s) => s.activeTab);
  const page = useOrdersStore((s) => s.page);
  const pageSize = useOrdersStore((s) => s.pageSize);
  const selectedOrder = useOrdersStore((s) => s.selectedOrder);
  const panelOpen = useOrdersStore((s) => s.panelOpen);
  const isRefreshing = useOrdersStore((s) => s.isRefreshing);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const hasError = useOrdersStore((s) => s.hasError);
  const dialogType = useOrdersStore((s) => s.dialogType);
  const dialogOrderId = useOrdersStore((s) => s.dialogOrderId);
  const statusForm = useOrdersStore((s) => s.statusForm);
  const supportForm = useOrdersStore((s) => s.supportForm);
  const acceptForm = useOrdersStore((s) => s.acceptForm);
  const rejectForm = useOrdersStore((s) => s.rejectForm);
  const verifyPaymentForm = useOrdersStore((s) => s.verifyPaymentForm);
  const assignTransportForm = useOrdersStore((s) => s.assignTransportForm);
  const markDeliveredForm = useOrdersStore((s) => s.markDeliveredForm);

  const setSearch = useOrdersStore((s) => s.setSearch);
  const setFilter = useOrdersStore((s) => s.setFilter);
  const applyTopFilters = useOrdersStore((s) => s.applyTopFilters);
  const resetFilters = useOrdersStore((s) => s.resetFilters);
  const setActiveTab = useOrdersStore((s) => s.setActiveTab);
  const setPage = useOrdersStore((s) => s.setPage);
  const selectOrder = useOrdersStore((s) => s.selectOrder);
  const closePanel = useOrdersStore((s) => s.closePanel);
  const openDialog = useOrdersStore((s) => s.openDialog);
  const closeDialog = useOrdersStore((s) => s.closeDialog);
  const setStatusForm = useOrdersStore((s) => s.setStatusForm);
  const setSupportForm = useOrdersStore((s) => s.setSupportForm);
  const setAcceptForm = useOrdersStore((s) => s.setAcceptForm);
  const setRejectForm = useOrdersStore((s) => s.setRejectForm);
  const setVerifyPaymentForm = useOrdersStore((s) => s.setVerifyPaymentForm);
  const setAssignTransportForm = useOrdersStore(
    (s) => s.setAssignTransportForm,
  );
  const setMarkDeliveredForm = useOrdersStore((s) => s.setMarkDeliveredForm);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const submitSupportTicket = useOrdersStore((s) => s.submitSupportTicket);
  const acceptOrder = useOrdersStore((s) => s.acceptOrder);
  const rejectOrder = useOrdersStore((s) => s.rejectOrder);
  const verifyPayment = useOrdersStore((s) => s.verifyPayment);
  const startProcessing = useOrdersStore((s) => s.startProcessing);
  const markDispatchReady = useOrdersStore((s) => s.markDispatchReady);
  const assignTransport = useOrdersStore((s) => s.assignTransport);
  const markInTransit = useOrdersStore((s) => s.markInTransit);
  const markDelivered = useOrdersStore((s) => s.markDelivered);
  const refreshData = useOrdersStore((s) => s.refreshData);
  const retryLoad = useOrdersStore((s) => s.retryLoad);
  const downloadInvoice = useOrdersStore((s) => s.downloadInvoice);
  const downloadDocument = useOrdersStore((s) => s.downloadDocument);
  const printOrder = useOrdersStore((s) => s.printOrder);
  const getFilteredOrders = useOrdersStore((s) => s.getFilteredOrders);
  const getPaginatedOrders = useOrdersStore((s) => s.getPaginatedOrders);
  const getComputedSummary = useOrdersStore((s) => s.getComputedSummary);
  const getTabCounts = useOrdersStore((s) => s.getTabCounts);
  const getOrderById = useOrdersStore((s) => s.getOrderById);

  const summary = getComputedSummary();
  const filtered = getFilteredOrders();
  const paginated = getPaginatedOrders();
  const tabCounts = getTabCounts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const dialogOrder = dialogOrderId
    ? (getOrderById(dialogOrderId) ?? null)
    : null;

  const hasFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "All Status" ||
    filters.warehouse !== "All Warehouses" ||
    filters.paymentType !== "All Payment Types" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    filters.orderValue !== "All Values";

  const handleDownloadInvoice = async (order: Order) => {
    toast.loading("Downloading...", { id: "inv-dl" });
    const result = await downloadInvoice(order.id);
    if (result === "ok") {
      toast.success("Invoice downloaded", { id: "inv-dl" });
    } else {
      toast.error("Invoice not available yet", { id: "inv-dl" });
    }
  };

  const handleDocumentDownload = async (documentId: string) => {
    if (!selectedOrder) return;
    toast.loading("Downloading...", { id: "doc-dl" });
    const result = await downloadDocument(selectedOrder.id, documentId);
    if (result === "ok") {
      toast.success("Document downloaded", { id: "doc-dl" });
    } else {
      toast.error("Document pending", { id: "doc-dl" });
    }
  };

  const handleStatusUpdate = () => {
    if (!dialogOrder) return;
    const result = updateOrderStatus(dialogOrder.id);
    if (result.ok) toast.success("Status Updated");
    else toast.error(result.error ?? "Unable to update status");
  };

  const handleSupportSubmit = () => {
    if (!dialogOrder) return;
    const ticket = submitSupportTicket(dialogOrder.id);
    if (ticket) {
      toast.success("Support ticket submitted");
    }
  };

  const runFlowAction = (order: Order) => {
    const next = getNextFlowAction(order);
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
        router.push(`${ROUTES.ORDERS}/${order.id}`);
        break;
    }
  };

  const handleApplyFilters = () => {
    applyTopFilters();
    toast.success("Filters applied");
  };

  const handleClearFilters = () => {
    resetFilters();
    toast.success("Filters cleared");
  };

  const handleRefresh = async () => {
    await refreshData();
    toast.success("Orders refreshed");
  };

  const handleRetry = async () => {
    await retryLoad();
    toast.success("Orders reloaded");
  };

  const handleRefreshClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (event.altKey) {
      useOrdersStore.setState({ hasError: true, isLoading: false });
      toast.error("Mock load error — use Retry");
      return;
    }
    await handleRefresh();
  };

  return (
    <div className="relative mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
      <LoadingOverlay open={isRefreshing} message="Refreshing orders..." />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Marketplace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Orders Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage customer orders from acceptance through payment verification,
            dispatch, tracking, and successful delivery.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TopFilters
          filters={filters}
          onFilterChange={setFilter}
          onApply={handleApplyFilters}
        />
        <SearchBar
          value={filters.search}
          onChange={setSearch}
          className="w-full lg:max-w-sm"
          placeholder="Search orders, buyers..."
        />
      </div>

      <OrdersTabs
        activeTab={activeTab}
        counts={tabCounts}
        onChange={setActiveTab}
      />

      <OrdersSummaryCards summary={summary} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <OrdersTable
          orders={paginated}
          selectedId={selectedOrder?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          isLoading={isLoading}
          hasError={hasError}
          hasFilters={hasFilters}
          filters={filters}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onClearFilters={handleClearFilters}
          onPageChange={setPage}
          onSelect={selectOrder}
          onDownloadInvoice={handleDownloadInvoice}
          onPrint={(order) => {
            printOrder(order.id);
            toast.success("Print dialog opened");
          }}
          onViewDetails={(order) => {
            router.push(`${ROUTES.ORDERS}/${order.id}`);
          }}
          onRetry={handleRetry}
        />
      </motion.div>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500"
          onClick={handleRefreshClick}
        >
          Refresh data
        </Button>
      </div>

      <OrderDrawer
        open={panelOpen}
        order={selectedOrder}
        onClose={closePanel}
        onUpdateStatus={() => {
          if (!selectedOrder) return;
          openDialog("update_status", selectedOrder.id);
        }}
        onSupportTicket={() => {
          if (!selectedOrder) return;
          openDialog("support_ticket", selectedOrder.id);
        }}
        onManageFlow={() => {
          if (!selectedOrder) return;
          runFlowAction(selectedOrder);
        }}
        onVerifyPayment={() => {
          if (!selectedOrder) return;
          openDialog("verify_payment", selectedOrder.id);
        }}
        onDownloadDocument={handleDocumentDownload}
        onViewCoa={() => toast.success("Opening COA preview...")}
      />

      <UpdateStatusModal
        open={dialogType === "update_status"}
        order={dialogOrder}
        form={statusForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setStatusForm}
        onSubmit={handleStatusUpdate}
      />

      <SupportTicketModal
        open={dialogType === "support_ticket"}
        order={dialogOrder}
        form={supportForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setSupportForm}
        onSubmit={handleSupportSubmit}
      />

      <AcceptOrderModal
        open={dialogType === "accept"}
        order={dialogOrder}
        form={acceptForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setAcceptForm}
        onConfirm={() => {
          if (!dialogOrder) return;
          acceptOrder(dialogOrder.id);
          toast.success("Proforma Invoice Generated");
        }}
      />

      <RejectOrderModal
        open={dialogType === "reject"}
        order={dialogOrder}
        form={rejectForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setRejectForm}
        onConfirm={() => {
          if (!dialogOrder) return;
          rejectOrder(dialogOrder.id);
          toast.success("Order Rejected");
        }}
      />

      <VerifyPaymentModal
        open={dialogType === "verify_payment"}
        order={dialogOrder}
        form={verifyPaymentForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setVerifyPaymentForm}
        onSubmit={() => {
          if (!dialogOrder) return;
          const result = verifyPayment(dialogOrder.id);
          if (result.ok) toast.success("Payment verified");
          else toast.error(result.error ?? "Verification failed");
        }}
      />

      <AssignTransportModal
        open={dialogType === "assign_transport"}
        order={dialogOrder}
        form={assignTransportForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setAssignTransportForm}
        onSubmit={() => {
          if (!dialogOrder) return;
          const result = assignTransport(dialogOrder.id);
          if (result.ok) toast.success("Transport assigned");
          else toast.error(result.error ?? "Assignment failed");
        }}
      />

      <MarkDeliveredModal
        open={dialogType === "mark_delivered"}
        order={dialogOrder}
        form={markDeliveredForm}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onChange={setMarkDeliveredForm}
        onSubmit={() => {
          if (!dialogOrder) return;
          const result = markDelivered(dialogOrder.id);
          if (result.ok) toast.success("Order delivered successfully");
          else toast.error(result.error ?? "Delivery confirmation failed");
        }}
      />
    </div>
  );
}
