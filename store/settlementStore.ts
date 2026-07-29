import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { computeSettlementSummary, settlementsMock } from "@/mock/settlements";
import type {
  Settlement,
  SettlementDialogType,
  SettlementFilters,
  SettlementSort,
  SettlementSortKey,
  SettlementSummary,
} from "@/types/settlements";
import { computeSettlementAudit } from "@/types/settlements";

interface SettlementState {
  settlements: Settlement[];
  selectedSettlement: Settlement | null;
  filters: SettlementFilters;
  sort: SettlementSort;
  page: number;
  pageSize: number;
  drawerOpen: boolean;
  loading: boolean;
  dialogType: SettlementDialogType;
  dialogSettlementId: string | null;

  bootstrap: () => void;
  setSearch: (search: string) => void;
  setFilter: <K extends keyof SettlementFilters>(
    key: K,
    value: SettlementFilters[K],
  ) => void;
  resetFilters: () => void;
  setSort: (key: SettlementSortKey) => void;
  setPage: (page: number) => void;
  selectSettlement: (settlement: Settlement) => void;
  selectSettlementById: (id: string) => boolean;
  closeDrawer: () => void;
  openDialog: (
    type: NonNullable<SettlementDialogType>,
    settlementId: string,
  ) => void;
  closeDialog: () => void;
  exportCsv: () => void;
  exportExcel: () => void;
  downloadInvoice: (settlementId: string) => void;
  downloadReceipt: (settlementId: string) => void;
  printReceipt: (settlementId: string) => void;
  sharePdf: (settlementId: string) => void;
  getFilteredSettlements: () => Settlement[];
  getSortedSettlements: () => Settlement[];
  getPaginatedSettlements: () => Settlement[];
  getComputedSummary: () => SettlementSummary;
  getSettlementById: (id: string) => Settlement | undefined;
  getAuditForSettlement: (settlement: Settlement) => Settlement["audit"];
  hasActiveFilters: () => boolean;
}

const defaultFilters: SettlementFilters = {
  search: "",
  status: "all",
  warehouse: "all",
  paymentMethod: "all",
  dateFrom: null,
  dateTo: null,
  amountMin: null,
  amountMax: null,
};

const defaultSort: SettlementSort = {
  key: "paymentDate",
  direction: "desc",
};

function syncSelected(
  settlements: Settlement[],
  selected: Settlement | null,
): Settlement | null {
  if (!selected) return null;
  return settlements.find((s) => s.id === selected.id) ?? null;
}

function mockPdf(name: string): void {
  const content = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 68 >>stream
BT /F1 18 Tf 72 720 Td (${name}) Tj ET
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
trailer<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function matchesSearch(settlement: Settlement, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    settlement.settlementId.toLowerCase().includes(q) ||
    settlement.orderRef.toLowerCase().includes(q) ||
    settlement.invoiceId.toLowerCase().includes(q) ||
    settlement.product.toLowerCase().includes(q) ||
    settlement.buyerCompany.toLowerCase().includes(q)
  );
}

function matchesFilters(
  settlement: Settlement,
  filters: SettlementFilters,
): boolean {
  if (filters.status !== "all" && settlement.status !== filters.status) {
    return false;
  }
  if (
    filters.warehouse !== "all" &&
    settlement.warehouse !== filters.warehouse
  ) {
    return false;
  }
  if (
    filters.paymentMethod !== "all" &&
    settlement.paymentDetails.paymentMode !== filters.paymentMethod
  ) {
    return false;
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    const created = new Date(settlement.createdAt).getTime();
    if (created < from) return false;
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    const created = new Date(settlement.createdAt).getTime();
    if (created > to) return false;
  }
  if (
    filters.amountMin !== null &&
    settlement.netSettlement < filters.amountMin
  ) {
    return false;
  }
  if (
    filters.amountMax !== null &&
    settlement.netSettlement > filters.amountMax
  ) {
    return false;
  }
  return matchesSearch(settlement, filters.search);
}

function compareSettlements(
  a: Settlement,
  b: Settlement,
  sort: SettlementSort,
): number {
  const dir = sort.direction === "asc" ? 1 : -1;
  const key = sort.key;

  if (key === "paymentDate") {
    const aDate = a.paymentDate ?? a.estimatedPaymentDate ?? a.createdAt;
    const bDate = b.paymentDate ?? b.estimatedPaymentDate ?? b.createdAt;
    return (new Date(aDate).getTime() - new Date(bDate).getTime()) * dir;
  }

  if (key === "status") {
    return a.status.localeCompare(b.status) * dir;
  }

  const aVal = a[key];
  const bVal = b[key];

  if (typeof aVal === "number" && typeof bVal === "number") {
    return (aVal - bVal) * dir;
  }

  return String(aVal).localeCompare(String(bVal)) * dir;
}

function settlementToCsvRow(s: Settlement): string {
  return [
    s.settlementId,
    s.orderRef,
    s.invoiceId,
    s.buyerCompany,
    s.product,
    s.quantityMt,
    s.invoiceAmount,
    s.netSettlement,
    s.paymentDate ?? s.estimatedPaymentDate ?? "",
    s.status,
    s.warehouse,
    s.paymentDetails.paymentMode,
  ]
    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
    .join(",");
}

export const useSettlementStore = create<SettlementState>()(
  devtools(
    (set, get) => ({
      settlements: settlementsMock,
      selectedSettlement: null,
      filters: defaultFilters,
      sort: defaultSort,
      page: 1,
      pageSize: 10,
      drawerOpen: false,
      loading: false,
      dialogType: null,
      dialogSettlementId: null,

      bootstrap: () => {
        set({ loading: true });
        window.setTimeout(() => {
          set({
            settlements: settlementsMock,
            loading: false,
          });
        }, 500);
      },

      setSearch: (search) =>
        set((s) => ({
          filters: { ...s.filters, search },
          page: 1,
        })),

      setFilter: (key, value) =>
        set((s) => ({
          filters: { ...s.filters, [key]: value },
          page: 1,
        })),

      resetFilters: () =>
        set({
          filters: defaultFilters,
          page: 1,
        }),

      setSort: (key) =>
        set((s) => ({
          sort: {
            key,
            direction:
              s.sort.key === key && s.sort.direction === "asc" ? "desc" : "asc",
          },
          page: 1,
        })),

      setPage: (page) => set({ page }),

      selectSettlement: (settlement) =>
        set({
          selectedSettlement: settlement,
          drawerOpen: true,
        }),

      selectSettlementById: (id) => {
        const settlement = get().getSettlementById(id);
        if (!settlement) return false;
        get().selectSettlement(settlement);
        return true;
      },

      closeDrawer: () =>
        set({
          drawerOpen: false,
        }),

      openDialog: (type, settlementId) =>
        set({
          dialogType: type,
          dialogSettlementId: settlementId,
        }),

      closeDialog: () =>
        set({
          dialogType: null,
          dialogSettlementId: null,
        }),

      exportCsv: () => {
        const rows = get().getFilteredSettlements().map(settlementToCsvRow);
        const header =
          "Settlement ID,Order Ref,Invoice ID,Buyer Company,Product,Quantity (MT),Invoice Amount,Net Settlement,Payment Date,Status,Warehouse,Payment Mode";
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `settlements-export-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },

      exportExcel: () => {
        const rows = get().getFilteredSettlements().map(settlementToCsvRow);
        const header =
          "Settlement ID\tOrder Ref\tInvoice ID\tBuyer Company\tProduct\tQuantity (MT)\tInvoice Amount\tNet Settlement\tPayment Date\tStatus\tWarehouse\tPayment Mode";
        const tsv = [header, ...rows.map((r) => r.replace(/,/g, "\t"))].join(
          "\n",
        );
        const blob = new Blob([tsv], {
          type: "application/vnd.ms-excel;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `settlements-export-${Date.now()}.xls`;
        link.click();
        URL.revokeObjectURL(url);
      },

      downloadInvoice: (settlementId) => {
        const settlement = get().getSettlementById(settlementId);
        if (!settlement) return;
        mockPdf(`${settlement.invoiceId}.pdf`);
      },

      downloadReceipt: (settlementId) => {
        const settlement = get().getSettlementById(settlementId);
        if (!settlement) return;
        mockPdf(`receipt-${settlement.settlementId}.pdf`);
      },

      printReceipt: (settlementId) => {
        const settlement = get().getSettlementById(settlementId);
        if (!settlement) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;
        printWindow.document.write(`
          <html><head><title>Receipt ${settlement.settlementId}</title></head>
          <body style="font-family:sans-serif;padding:40px">
            <h1>Settlement Receipt</h1>
            <p><strong>Settlement ID:</strong> ${settlement.settlementId}</p>
            <p><strong>Order Ref:</strong> ${settlement.orderRef}</p>
            <p><strong>Net Settlement:</strong> ₹${settlement.netSettlement.toLocaleString("en-IN")}</p>
            <p><strong>UTR:</strong> ${settlement.paymentDetails.utrNumber ?? "N/A"}</p>
          </body></html>
        `);
        printWindow.document.close();
        printWindow.print();
      },

      sharePdf: (settlementId) => {
        const settlement = get().getSettlementById(settlementId);
        if (!settlement) return;
        const shareData = {
          title: `Settlement ${settlement.settlementId}`,
          text: `Settlement details for ${settlement.orderRef}`,
          url: `${window.location.origin}/settlements/${settlement.settlementId}`,
        };
        if (navigator.share) {
          void navigator.share(shareData);
        } else {
          void navigator.clipboard.writeText(shareData.url);
        }
      },

      getFilteredSettlements: () => {
        const { settlements, filters } = get();
        return settlements.filter((s) => matchesFilters(s, filters));
      },

      getSortedSettlements: () => {
        const filtered = get().getFilteredSettlements();
        const { sort } = get();
        return [...filtered].sort((a, b) => compareSettlements(a, b, sort));
      },

      getPaginatedSettlements: () => {
        const sorted = get().getSortedSettlements();
        const { page, pageSize } = get();
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
      },

      getComputedSummary: () => computeSettlementSummary(get().settlements),

      getSettlementById: (id) =>
        get().settlements.find((s) => s.id === id || s.settlementId === id),

      getAuditForSettlement: (settlement) =>
        computeSettlementAudit({
          grossInvoiceValue: settlement.audit.grossInvoiceValue,
          commissionRate: settlement.audit.commissionRate,
          tdsRate: settlement.audit.tdsRate,
          gstReversal: settlement.audit.gstReversal,
          inputTaxCredit: settlement.audit.inputTaxCredit,
          platformCharges: settlement.audit.platformCharges,
          otherAdjustments: settlement.audit.otherAdjustments,
        }),

      hasActiveFilters: () => {
        const { filters } = get();
        return (
          Boolean(filters.search.trim()) ||
          filters.status !== "all" ||
          filters.warehouse !== "all" ||
          filters.paymentMethod !== "all" ||
          Boolean(filters.dateFrom) ||
          Boolean(filters.dateTo) ||
          filters.amountMin !== null ||
          filters.amountMax !== null
        );
      },
    }),
    { name: "settlement-store" },
  ),
);

// Keep selected settlement in sync when settlements array updates
useSettlementStore.subscribe((state, prev) => {
  if (state.settlements !== prev.settlements && state.selectedSettlement) {
    const synced = syncSelected(state.settlements, state.selectedSettlement);
    if (synced !== state.selectedSettlement) {
      useSettlementStore.setState({ selectedSettlement: synced });
    }
  }
});
