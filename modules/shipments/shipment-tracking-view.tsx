"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { LoadingOverlay } from "@/components/marketplace/loading-overlay";
import {
  GenerateEWayModal,
  GenerateInvoiceModal,
  LoadingSkeleton,
  MarkDeliveredModal,
  ShipmentDrawer,
  ShipmentFilterBar,
  ShipmentSummaryCards,
  ShipmentTable,
  ShipmentTabs,
  UploadPODModal,
} from "@/components/shipments";
import { Button } from "@/components/ui/button";
import { useShipmentStore } from "@/store/shipmentStore";
import type { Shipment } from "@/types/shipments";

interface ShipmentTrackingViewProps {
  initialShipmentId?: string;
}

export function ShipmentTrackingView({
  initialShipmentId,
}: ShipmentTrackingViewProps) {
  useEffect(() => {
    useShipmentStore.setState({ isLoading: true });
    const timer = window.setTimeout(() => {
      useShipmentStore.setState({ isLoading: false });
    }, 550);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialShipmentId) {
      useShipmentStore.getState().selectShipmentById(initialShipmentId);
    }
  }, [initialShipmentId]);

  const filters = useShipmentStore((s) => s.filters);
  const activeTab = useShipmentStore((s) => s.activeTab);
  const page = useShipmentStore((s) => s.page);
  const pageSize = useShipmentStore((s) => s.pageSize);
  const selectedShipment = useShipmentStore((s) => s.selectedShipment);
  const panelOpen = useShipmentStore((s) => s.panelOpen);
  const isRefreshing = useShipmentStore((s) => s.isRefreshing);
  const isLoading = useShipmentStore((s) => s.isLoading);
  const dialogType = useShipmentStore((s) => s.dialogType);
  const dialogShipmentId = useShipmentStore((s) => s.dialogShipmentId);
  const ewayForm = useShipmentStore((s) => s.ewayForm);
  const markDeliveredForm = useShipmentStore((s) => s.markDeliveredForm);
  const uploadPodForm = useShipmentStore((s) => s.uploadPodForm);

  const setFilter = useShipmentStore((s) => s.setFilter);
  const resetFilters = useShipmentStore((s) => s.resetFilters);
  const setActiveTab = useShipmentStore((s) => s.setActiveTab);
  const setPage = useShipmentStore((s) => s.setPage);
  const selectShipment = useShipmentStore((s) => s.selectShipment);
  const closePanel = useShipmentStore((s) => s.closePanel);
  const openDialog = useShipmentStore((s) => s.openDialog);
  const closeDialog = useShipmentStore((s) => s.closeDialog);
  const setEwayForm = useShipmentStore((s) => s.setEwayForm);
  const setMarkDeliveredForm = useShipmentStore((s) => s.setMarkDeliveredForm);
  const setUploadPodForm = useShipmentStore((s) => s.setUploadPodForm);
  const generateInvoice = useShipmentStore((s) => s.generateInvoice);
  const generateEway = useShipmentStore((s) => s.generateEway);
  const uploadPod = useShipmentStore((s) => s.uploadPod);
  const markDelivered = useShipmentStore((s) => s.markDelivered);
  const refreshData = useShipmentStore((s) => s.refreshData);
  const exportCsv = useShipmentStore((s) => s.exportCsv);
  const downloadDocument = useShipmentStore((s) => s.downloadDocument);
  const previewDocument = useShipmentStore((s) => s.previewDocument);
  const getFilteredShipments = useShipmentStore((s) => s.getFilteredShipments);
  const getPaginatedShipments = useShipmentStore(
    (s) => s.getPaginatedShipments,
  );
  const getComputedSummary = useShipmentStore((s) => s.getComputedSummary);
  const getTabCounts = useShipmentStore((s) => s.getTabCounts);
  const getShipmentById = useShipmentStore((s) => s.getShipmentById);

  const summary = getComputedSummary();
  const filtered = getFilteredShipments();
  const paginated = getPaginatedShipments();
  const tabCounts = getTabCounts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const dialogShipment = dialogShipmentId
    ? (getShipmentById(dialogShipmentId) ?? null)
    : null;

  const hasFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "All Statuses" ||
    filters.location !== "All Locations" ||
    filters.transporter !== "All Transporters" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const handleExport = () => {
    exportCsv();
    toast.success("Shipment data exported");
  };

  const _handleRefresh = async () => {
    await refreshData();
    toast.success("Shipments refreshed");
  };

  const openFor =
    (type: NonNullable<typeof dialogType>) => (shipment: Shipment) => {
      selectShipment(shipment);
      openDialog(type, shipment.id);
    };

  const handleGenerateInvoice = () => {
    if (!dialogShipment) return;
    generateInvoice(dialogShipment.id);
    toast.success("Invoice generated successfully");
  };

  const handleGenerateEway = () => {
    if (!dialogShipment) return;
    const result = generateEway(dialogShipment.id);
    toast.success(`E-Way Bill ${result.ewayBillNumber} generated`);
  };

  const handleUploadPod = () => {
    if (!dialogShipment) return;
    const result = uploadPod(dialogShipment.id);
    if (!result.ok) {
      toast.error(result.reason ?? "Upload failed");
      return;
    }
    toast.success("POD uploaded successfully");
  };

  const handleMarkDelivered = () => {
    if (!dialogShipment) return;
    const result = markDelivered(dialogShipment.id);
    if (!result.ok) {
      toast.error(result.reason ?? "Unable to mark delivered");
      return;
    }
    toast.success("Shipment marked as delivered");
  };

  const handleDownloadInvoice = async () => {
    if (!dialogShipment) return;
    const doc = dialogShipment.documents.find((d) => d.type === "invoice");
    if (!doc) return;
    toast.loading("Downloading...", { id: "inv-dl" });
    const result = await downloadDocument(dialogShipment.id, doc.id);
    if (result === "ok") {
      toast.success("Invoice downloaded", { id: "inv-dl" });
    } else {
      toast.error("Invoice not available", { id: "inv-dl" });
    }
  };

  const handlePrintInvoice = () => {
    toast.success("Print dialog opened");
    window.print();
  };

  const handleDocumentDownload = async (documentId: string) => {
    if (!selectedShipment) return;
    toast.loading("Downloading...", { id: "doc-dl" });
    const result = await downloadDocument(selectedShipment.id, documentId);
    if (result === "ok") {
      toast.success("Document downloaded", { id: "doc-dl" });
    } else {
      toast.error("Document not available", { id: "doc-dl" });
    }
  };

  const handleDocumentPreview = (documentId: string) => {
    if (!selectedShipment) return;
    previewDocument(selectedShipment.id, documentId);
    toast.success("Document preview opened");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
      <LoadingOverlay open={isRefreshing} message="Refreshing shipments..." />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Shipment Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Track dispatches and delivery progress across all customer orders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="h-10 gap-2 bg-[#0B1F3A] hover:bg-[#16345A]"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <ShipmentSummaryCards summary={summary} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ShipmentTabs
            activeTab={activeTab}
            counts={tabCounts}
            onChange={setActiveTab}
            className="flex-1 border-b-0"
          />
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 gap-1.5 sm:flex"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export Data
          </Button>
        </div>

        <ShipmentFilterBar
          filters={filters}
          onFilterChange={setFilter}
          onClear={() => {
            resetFilters();
            toast.success("Filters cleared");
          }}
        />

        <ShipmentTable
          shipments={paginated}
          selectedId={selectedShipment?.id}
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          hasFilters={hasFilters}
          onPageChange={setPage}
          onSelect={selectShipment}
          onView={(s) => selectShipment(s)}
          onGenerateInvoice={openFor("generate_invoice")}
          onGenerateEway={openFor("generate_eway")}
          onUploadPod={openFor("upload_pod")}
          onMarkDelivered={openFor("mark_delivered")}
          onExport={handleExport}
        />
      </motion.div>

      <ShipmentDrawer
        open={panelOpen}
        shipment={selectedShipment}
        onClose={closePanel}
        onGenerateInvoice={() => {
          if (selectedShipment)
            openDialog("generate_invoice", selectedShipment.id);
        }}
        onGenerateEway={() => {
          if (selectedShipment)
            openDialog("generate_eway", selectedShipment.id);
        }}
        onUploadPod={() => {
          if (selectedShipment) openDialog("upload_pod", selectedShipment.id);
        }}
        onMarkDelivered={() => {
          if (selectedShipment)
            openDialog("mark_delivered", selectedShipment.id);
        }}
        onDownloadDocument={handleDocumentDownload}
        onPreviewDocument={handleDocumentPreview}
      />

      <GenerateInvoiceModal
        open={
          dialogType === "generate_invoice" || dialogType === "preview_invoice"
        }
        shipment={dialogShipment}
        onOpenChange={(open) => !open && closeDialog()}
        onGenerate={handleGenerateInvoice}
        onDownload={handleDownloadInvoice}
        onPrint={handlePrintInvoice}
      />

      <GenerateEWayModal
        open={dialogType === "generate_eway"}
        shipment={dialogShipment}
        form={ewayForm}
        onFormChange={setEwayForm}
        onOpenChange={(open) => !open && closeDialog()}
        onGenerate={handleGenerateEway}
      />

      <UploadPODModal
        open={dialogType === "upload_pod"}
        shipment={dialogShipment}
        form={uploadPodForm}
        onFormChange={setUploadPodForm}
        onOpenChange={(open) => !open && closeDialog()}
        onUpload={handleUploadPod}
      />

      <MarkDeliveredModal
        open={dialogType === "mark_delivered"}
        shipment={dialogShipment}
        form={markDeliveredForm}
        onFormChange={setMarkDeliveredForm}
        onOpenChange={(open) => !open && closeDialog()}
        onConfirm={handleMarkDelivered}
      />
    </div>
  );
}
