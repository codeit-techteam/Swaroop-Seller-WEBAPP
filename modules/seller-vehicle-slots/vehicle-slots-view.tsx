"use client";

import {
  CalendarDays,
  Download,
  List,
  Plus,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  useBookVehicleSlot,
  useCancelVehicleSlot,
  useExportVehicleSlots,
  useLogisticsWarehouses,
  useVehicleSlots,
  useVehicleSlotSummary,
  vehicleSlotApiError,
} from "@/hooks/use-vehicle-slots";
import { csvEscape } from "@/lib/seller-ops";
import { downloadFile } from "@/lib/utils";
import type {
  LogisticsVehicleType,
  SellerVehicleSlot,
  VehicleSlotListParams,
  VehicleSlotStatus,
} from "@/types/vehicle-slots";
import {
  LOGISTICS_VEHICLE_TYPES,
  VEHICLE_SLOT_STATUSES,
} from "@/types/vehicle-slots";

import { BookVehicleSlotModal } from "./book-modal";
import { VehicleSlotCalendar } from "./calendar";
import { VehicleSlotDrawer } from "./drawer";
import { VehicleSlotKpis } from "./kpis";
import { VehicleSlotSkeleton } from "./skeleton";
import { VehicleSlotTable } from "./table";

function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function SellerVehicleSlotsView() {
  const searchParams = useSearchParams();
  const queryDispatchOrOrder = searchParams.get("orderId") ?? "";

  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState<"all" | VehicleSlotStatus>("all");
  const [vehicleType, setVehicleType] = useState<"all" | LogisticsVehicleType>(
    "all",
  );
  const [carrier, setCarrier] = useState("");
  const [order, setOrder] = useState(queryDispatchOrOrder);
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SellerVehicleSlot | null>(null);
  const [bookOpen, setBookOpen] = useState(Boolean(queryDispatchOrOrder));
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [calendarDate, setCalendarDate] = useState(todayIsoLocal());

  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedOrder = useDebouncedValue(order, 350);
  const debouncedCarrier = useDebouncedValue(carrier, 350);

  const listParams: VehicleSlotListParams = useMemo(() => {
    const base: VehicleSlotListParams = {
      page,
      limit: 20,
      status,
      warehouseId: warehouse,
      vehicleType,
      carrier: debouncedCarrier || undefined,
      orderId: debouncedOrder || undefined,
      search: debouncedSearch || undefined,
      sortBy: "slotDate",
      sortOrder: "desc",
    };
    if (view === "calendar") {
      // Load a 14-day window so calendar counts and selected-day list share one source.
      const [y, m, d] = calendarDate.split("-").map(Number);
      const anchor = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
      const day = anchor.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      const start = new Date(anchor);
      start.setUTCDate(start.getUTCDate() + diff);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 13);
      base.dateFrom = start.toISOString().slice(0, 10);
      base.dateTo = end.toISOString().slice(0, 10);
      base.page = 1;
      base.limit = 200;
    } else if (date) {
      base.date = date;
    }
    return base;
  }, [
    calendarDate,
    date,
    debouncedCarrier,
    debouncedOrder,
    debouncedSearch,
    page,
    status,
    vehicleType,
    view,
    warehouse,
  ]);

  const slotsQuery = useVehicleSlots(listParams);
  const summaryQuery = useVehicleSlotSummary(todayIsoLocal());
  const warehousesQuery = useLogisticsWarehouses();
  const bookMutation = useBookVehicleSlot();
  const cancelMutation = useCancelVehicleSlot();
  const exportMutation = useExportVehicleSlots();

  const allRows = slotsQuery.data?.items ?? [];
  const rows =
    view === "calendar"
      ? allRows.filter((item) => item.slotDate === calendarDate)
      : allRows;
  const calendarRows = allRows;
  const pagination = slotsQuery.data?.pagination;

  const carriers = useMemo(() => {
    return Array.from(
      new Set(
        rows
          .map((item) => item.carrier)
          .filter((value): value is string => Boolean(value)),
      ),
    );
  }, [rows]);

  const reset = () => {
    setSearch("");
    setWarehouse("all");
    setStatus("all");
    setVehicleType("all");
    setCarrier("");
    setOrder("");
    setDate("");
    setPage(1);
    toast.success("Filters reset");
  };

  const exportCsv = async () => {
    try {
      const items = await exportMutation.mutateAsync({
        status,
        warehouseId: warehouse,
        date: date || undefined,
        vehicleType,
        carrier: debouncedCarrier || undefined,
        orderId: debouncedOrder || undefined,
        search: debouncedSearch || undefined,
      });
      if (items.length === 0) {
        toast.error("No vehicle slots to export for the current filters.");
        return;
      }
      const lines = [
        [
          "Slot ID",
          "Order ID",
          "Dispatch",
          "Warehouse",
          "Vehicle",
          "Type",
          "Carrier",
          "Driver",
          "Date",
          "Time",
          "Bay",
          "Quantity",
          "Status",
        ].join(","),
        ...items.map((row) =>
          [
            csvEscape(row.slotNumber ?? row.id),
            csvEscape(row.purchaseOrderReference ?? row.orderId ?? ""),
            csvEscape(row.dispatchNumber ?? ""),
            csvEscape(row.warehouseName ?? ""),
            csvEscape(row.vehicleNumber ?? ""),
            csvEscape(row.vehicleType ?? ""),
            csvEscape(row.carrier ?? ""),
            csvEscape(row.driverName ?? ""),
            row.slotDate,
            csvEscape(row.timeSlot ?? ""),
            csvEscape(row.loadingBay ?? ""),
            String(row.quantityMt ?? ""),
            row.status,
          ].join(","),
        ),
      ];
      downloadFile(lines.join("\n"), "vehicle-slots.csv", "text/csv");
      toast.success("Export downloaded");
    } catch (error) {
      toast.error(
        vehicleSlotApiError(error, "Unable to export vehicle slots."),
      );
    }
  };

  if (slotsQuery.isLoading && !slotsQuery.data) {
    return (
      <PageContainer>
        <VehicleSlotSkeleton />
      </PageContainer>
    );
  }

  if (slotsQuery.isError && !slotsQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load vehicle slots."
          description={vehicleSlotApiError(
            slotsQuery.error,
            "Please try again.",
          )}
          onRetry={() => void slotsQuery.refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1400px]">
      <PageHeader
        title="Vehicle Slots"
        description="Manage vehicle booking and loading appointments."
        actions={
          <>
            <Button
              className="bg-[#0B1F3A] hover:bg-[#122846]"
              onClick={() => setBookOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Book Vehicle Slot
            </Button>
            <Button
              variant="outline"
              disabled={exportMutation.isPending}
              onClick={() => void exportCsv()}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <VehicleSlotKpis
        summary={summaryQuery.data}
        loading={summaryQuery.isLoading}
      />

      <div className="mt-4 flex gap-2">
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          onClick={() => {
            setView("calendar");
            setPage(1);
          }}
        >
          <CalendarDays className="h-4 w-4" />
          Calendar View
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4" />
          List View
        </Button>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3 lg:grid-cols-7">
        <Select
          value={warehouse}
          onValueChange={(value) => {
            setWarehouse(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {(warehousesQuery.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as "all" | VehicleSlotStatus);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {VEHICLE_SLOT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={vehicleType}
          onValueChange={(value) => {
            setVehicleType(value as "all" | LogisticsVehicleType);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {LOGISTICS_VEHICLE_TYPES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={carrier}
          onChange={(event) => {
            setCarrier(event.target.value);
            setPage(1);
          }}
          placeholder={
            carriers[0] ? `Carrier (e.g. ${carriers[0]})` : "Carrier"
          }
        />
        <Input
          value={order}
          onChange={(event) => {
            setOrder(event.target.value);
            setPage(1);
          }}
          placeholder="Order / Dispatch"
        />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search slot, vehicle or dispatch"
        />
        <Button variant="ghost" className="w-fit" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {view === "calendar" ? (
          <VehicleSlotCalendar
            slots={calendarRows}
            selectedDate={calendarDate}
            anchorDate={calendarDate}
            onSelectDate={(next) => {
              setCalendarDate(next);
              setPage(1);
            }}
          />
        ) : null}
        {rows.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No vehicle slots found"
            description="Book a loading appointment against an eligible confirmed dispatch."
            action={
              <Button onClick={() => setBookOpen(true)}>
                Book Vehicle Slot
              </Button>
            }
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <VehicleSlotTable
              rows={rows}
              onView={(row) => setSelected(row)}
              onCancel={(row) => {
                setSelected(row);
                setCancelOpen(true);
              }}
            />
            {view === "list" && pagination ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} ·{" "}
                  {pagination.total} slots
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page <= 1 || slotsQuery.isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      pagination.page >= pagination.totalPages ||
                      slotsQuery.isFetching
                    }
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </TooltipProvider>
        )}
      </div>

      <VehicleSlotDrawer
        slot={selected}
        busy={cancelMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onCancel={() => setCancelOpen(true)}
      />

      <BookVehicleSlotModal
        open={bookOpen}
        busy={bookMutation.isPending}
        onOpenChange={setBookOpen}
        onSubmit={async (payload) => {
          try {
            const slot = await bookMutation.mutateAsync(payload);
            setBookOpen(false);
            toast.success(
              `Vehicle slot booked successfully. ${slot.slotNumber ?? ""} · ${
                slot.purchaseOrderReference ?? slot.dispatchNumber ?? ""
              } · ${slot.slotDate} ${slot.timeSlot ?? ""} · ${
                slot.vehicleNumber ?? ""
              } · ${slot.loadingBay ?? ""}`.trim(),
            );
          } catch (error) {
            toast.error(
              vehicleSlotApiError(error, "Unable to book this vehicle slot."),
            );
            throw error;
          }
        }}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel vehicle slot</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Cancellation reason (optional)"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep slot
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending || !selected}
              onClick={async () => {
                if (!selected) return;
                try {
                  await cancelMutation.mutateAsync(selected.id);
                  setCancelOpen(false);
                  setCancelReason("");
                  setSelected(null);
                  toast.success("Vehicle slot cancelled.");
                } catch (error) {
                  toast.error(
                    vehicleSlotApiError(
                      error,
                      "Unable to cancel this vehicle slot.",
                    ),
                  );
                }
              }}
            >
              Cancel Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
