"use client";

import { motion } from "framer-motion";
import { Download, FileSpreadsheet } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { LoadingOverlay } from "@/components/marketplace/loading-overlay";
import {
  OrderDrawer,
  OrdersSummaryCards,
  OrdersTable,
  OrdersTabs,
  SearchBar,
  SupportTicketModal,
  TopFilters,
  UpdateStatusModal,
} from "@/components/orders";
import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/store/ordersStore";
import type { Order } from "@/types/orders";

export function OrdersView() {
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
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const submitSupportTicket = useOrdersStore((s) => s.submitSupportTicket);
  const refreshData = useOrdersStore((s) => s.refreshData);
  const retryLoad = useOrdersStore((s) => s.retryLoad);
  const exportCsv = useOrdersStore((s) => s.exportCsv);
  const downloadInvoice = useOrdersStore((s) => s.downloadInvoice);
  const downloadInvoicesBulk = useOrdersStore((s) => s.downloadInvoicesBulk);
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

  const handleExport = () => {
    exportCsv();
    toast.success("CSV Exported");
  };

  const handleDownloadInvoices = async () => {
    toast.loading("Downloading invoices...", { id: "bulk-inv" });
    const count = await downloadInvoicesBulk();
    if (count === 0) {
      toast.error("No invoices available", { id: "bulk-inv" });
      return;
    }
    toast.success(`Downloaded ${Math.min(count, 5)} invoice(s)`, {
      id: "bulk-inv",
    });
  };

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
    updateOrderStatus(dialogOrder.id);
    toast.success("Status Updated");
  };

  const handleSupportSubmit = () => {
    if (!dialogOrder) return;
    const ticket = submitSupportTicket(dialogOrder.id);
    if (ticket) {
      toast.success("Support ticket submitted");
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

  // Allow QA to demo error state: Alt+click "Refresh data"
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
            View allocated orders, update dispatch status, and manage
            documentation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-10 gap-2 border-slate-200"
            onClick={handleDownloadInvoices}
          >
            <Download className="h-4 w-4" />
            Download Invoices
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2 border-[#1B6EF3] text-[#1B6EF3] hover:bg-[#E8F1FF]"
            onClick={handleExport}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
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
          onViewDetails={selectOrder}
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
    </div>
  );
}
