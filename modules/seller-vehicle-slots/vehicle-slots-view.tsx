"use client";

import { CalendarDays, Download, List, Plus, RotateCcw, Truck } from "lucide-react";
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
import { OPS_WAREHOUSES } from "@/lib/mock/seller-ops";
import { csvEscape, todayIsoDate } from "@/lib/seller-ops";
import { downloadFile } from "@/lib/utils";
import { useSellerOpsStore } from "@/store/sellerOpsStore";
import type { VehicleSlot } from "@/types/seller-ops";

import {
  type BookSlotForm,
  BookVehicleSlotModal,
  emptyBookSlotForm,
} from "./book-modal";
import { VehicleSlotCalendar } from "./calendar";
import { VehicleSlotDrawer } from "./drawer";
import { VehicleSlotKpis } from "./kpis";
import { VehicleSlotSkeleton } from "./skeleton";
import { VehicleSlotTable } from "./table";

export function SellerVehicleSlotsView() {
  const searchParams = useSearchParams();
  const loading = useSellerOpsStore((s) => s.loading);
  const error = useSellerOpsStore((s) => s.error);
  const busy = useSellerOpsStore((s) => s.busy);
  const slots = useSellerOpsStore((s) => s.vehicleSlots);
  const records = useSellerOpsStore((s) => s.procurementRecords);
  const bootstrap = useSellerOpsStore((s) => s.bootstrap);
  const retry = useSellerOpsStore((s) => s.retry);
  const bookVehicleSlot = useSellerOpsStore((s) => s.bookVehicleSlot);
  const rescheduleVehicleSlot = useSellerOpsStore((s) => s.rescheduleVehicleSlot);
  const cancelVehicleSlot = useSellerOpsStore((s) => s.cancelVehicleSlot);
  const advanceSlotStatus = useSellerOpsStore((s) => s.advanceSlotStatus);

  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState("all");
  const [vehicleType, setVehicleType] = useState("all");
  const [carrier, setCarrier] = useState("all");
  const [order, setOrder] = useState("");
  const [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryOrderId = searchParams.get("orderId");
  const queryRecord = records.find((item) => item.orderId === queryOrderId);
  const [bookOpen, setBookOpen] = useState(Boolean(queryOrderId));
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [calendarDate, setCalendarDate] = useState(todayIsoDate());
  const [form, setForm] = useState<BookSlotForm>({
    ...emptyBookSlotForm,
    orderId: queryOrderId ?? "",
    purchaseRequestId: queryRecord?.purchaseRequestId ?? "",
    quantityMt: queryRecord?.quantityMt ?? 20,
  });

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const bookingForm: BookSlotForm = {
    ...form,
    purchaseRequestId:
      form.purchaseRequestId || queryRecord?.purchaseRequestId || "",
    quantityMt: form.quantityMt || queryRecord?.quantityMt || 20,
  };

  const selected = slots.find((item) => item.id === selectedId) ?? null;
  const carriers = useMemo(
    () => Array.from(new Set(slots.map((item) => item.carrier))),
    [slots],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return slots.filter((item) => {
      if (warehouse !== "all" && item.warehouseId !== warehouse) return false;
      if (status !== "all" && item.status !== status) return false;
      if (vehicleType !== "all" && item.vehicleType !== vehicleType) return false;
      if (carrier !== "all" && item.carrier !== carrier) return false;
      if (order && !item.orderId.toLowerCase().includes(order.toLowerCase())) {
        return false;
      }
      if (date && item.date !== date) return false;
      if (view === "calendar" && item.date !== calendarDate) return false;
      if (!query) return true;
      return [
        item.id,
        item.orderId,
        item.warehouseName,
        item.vehicleNumber,
        item.driverName,
        item.carrier,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    calendarDate,
    carrier,
    date,
    order,
    search,
    slots,
    status,
    vehicleType,
    view,
    warehouse,
  ]);

  const reset = () => {
    setSearch("");
    setWarehouse("all");
    setStatus("all");
    setVehicleType("all");
    setCarrier("all");
    setOrder("");
    setDate("");
    toast.success("Filters reset");
  };

  const exportCsv = () => {
    const lines = [
      [
        "Slot ID",
        "Order ID",
        "Warehouse",
        "Vehicle",
        "Type",
        "Carrier",
        "Date",
        "Time",
        "Status",
      ].join(","),
      ...filtered.map((row) =>
        [
          csvEscape(row.id),
          csvEscape(row.orderId),
          csvEscape(row.warehouseName),
          csvEscape(row.vehicleNumber),
          row.vehicleType,
          csvEscape(row.carrier),
          row.date,
          row.timeSlot,
          row.status,
        ].join(","),
      ),
    ];
    downloadFile(lines.join("\n"), "vehicle-slots.csv", "text/csv");
    toast.success("Export downloaded");
  };

  const openReschedule = (slot: VehicleSlot) => {
    setSelectedId(slot.id);
    setForm({
      ...emptyBookSlotForm,
      orderId: slot.orderId,
      purchaseRequestId: slot.purchaseRequestId,
      warehouseId: slot.warehouseId,
      quantityMt: slot.quantityMt,
      vehicleType: slot.vehicleType,
      vehicleNumber: slot.vehicleNumber,
      carrier: slot.carrier,
      driverName: slot.driverName,
      driverPhone: slot.driverPhone,
      date: slot.date,
      timeSlot: slot.timeSlot,
      loadingBay: slot.loadingBay,
      notes: slot.notes ?? "",
    });
    setRescheduleOpen(true);
  };

  if (loading) {
    return (
      <PageContainer>
        <VehicleSlotSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load vehicle slots."
          description="Please try again."
          onRetry={() => void retry()}
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
              onClick={() => {
                setForm(emptyBookSlotForm);
                setBookOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Book Vehicle Slot
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <VehicleSlotKpis rows={slots} />

      <div className="mt-4 flex gap-2">
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          onClick={() => setView("calendar")}
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
        <Select value={warehouse} onValueChange={setWarehouse}>
          <SelectTrigger>
            <SelectValue placeholder="Warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {OPS_WAREHOUSES.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["BOOKED", "ARRIVED", "LOADING", "COMPLETED", "CANCELLED"].map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select value={vehicleType} onValueChange={setVehicleType}>
          <SelectTrigger>
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {["Trailer", "Tanker", "Container", "Truck", "Tempo"].map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger>
            <SelectValue placeholder="Carrier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All carriers</SelectItem>
            {carriers.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          placeholder="Order"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search slot, vehicle or driver"
        />
        <Button variant="ghost" className="w-fit" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {view === "calendar" ? (
          <VehicleSlotCalendar
            slots={slots}
            selectedDate={calendarDate}
            onSelectDate={setCalendarDate}
          />
        ) : null}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No vehicle slots booked"
            description="Book a loading appointment against a confirmed order."
            action={
              <Button onClick={() => setBookOpen(true)}>Book Vehicle Slot</Button>
            }
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <VehicleSlotTable
              rows={filtered}
              onView={(row) => setSelectedId(row.id)}
              onReschedule={openReschedule}
              onCancel={(row) => {
                setSelectedId(row.id);
                setCancelOpen(true);
              }}
            />
          </TooltipProvider>
        )}
      </div>

      <VehicleSlotDrawer
        slot={selected}
        busy={busy}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onReschedule={() => selected && openReschedule(selected)}
        onCancel={() => setCancelOpen(true)}
        onArrive={async () => {
          if (!selected) return;
          await advanceSlotStatus(selected.id, "ARRIVED");
          toast.success("Vehicle marked as arrived.");
        }}
        onLoadingStart={async () => {
          if (!selected) return;
          await advanceSlotStatus(selected.id, "LOADING");
          toast.success("Loading started.");
        }}
        onLoadingComplete={async () => {
          if (!selected) return;
          await advanceSlotStatus(selected.id, "COMPLETED");
          toast.success("Loading completed. Shipment is in transit.");
        }}
      />

      <BookVehicleSlotModal
        open={bookOpen}
        busy={busy}
        slots={slots}
        form={bookingForm}
        onChange={setForm}
        onOpenChange={setBookOpen}
        onSubmit={async () => {
          try {
            await bookVehicleSlot(bookingForm);
            setBookOpen(false);
            toast.success("Vehicle slot booked successfully.");
          } catch (caught) {
            toast.error(
              caught instanceof Error
                ? caught.message
                : "Unable to book this slot.",
            );
          }
        }}
      />

      <BookVehicleSlotModal
        open={rescheduleOpen}
        busy={busy}
        mode="reschedule"
        slots={slots.filter((item) => item.id !== selectedId)}
        form={form}
        onChange={setForm}
        onOpenChange={setRescheduleOpen}
        onSubmit={async () => {
          if (!selectedId) return;
          try {
            await rescheduleVehicleSlot(
              selectedId,
              form.date,
              form.timeSlot,
              form.loadingBay,
            );
            setRescheduleOpen(false);
            toast.success("Vehicle slot rescheduled.");
          } catch (caught) {
            toast.error(
              caught instanceof Error
                ? caught.message
                : "Unable to reschedule this slot.",
            );
          }
        }}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel vehicle slot</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Cancellation reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep slot
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                if (!selectedId) return;
                await cancelVehicleSlot(selectedId, cancelReason);
                setCancelOpen(false);
                setCancelReason("");
                toast.success("Vehicle slot cancelled.");
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
