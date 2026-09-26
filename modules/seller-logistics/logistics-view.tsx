"use client";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  MoreHorizontal,
  PackageCheck,
  RefreshCw,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DetailDrawer } from "@/components/drawers/detail-drawer";
import {
  ShipmentCards,
  ShipmentDetailDrawer,
  ShipmentEmptyState,
  ShipmentPageSkeleton,
  ShipmentStatusTabs,
  ShipmentTable,
} from "@/components/seller";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dispatchApiError,
  useAssignDispatchVehicle,
  useCompleteDispatchLoading,
  useExecuteSellerDispatch,
  useSellerDispatch,
  useSellerDispatches,
  useSellerDispatchSummary,
  useSellerDispatchTimeline,
  useStartDispatchLoading,
  useUpsertDispatchEway,
} from "@/hooks/use-seller-dispatches";
import {
  useLogisticsDrivers,
  useLogisticsVehicles,
} from "@/hooks/use-vehicle-slots";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { ROUTES } from "@/lib/constants";
import {
  getShipmentById,
  getShipmentsByLocation,
} from "@/lib/repositories/shipments";
import { formatMt } from "@/lib/seller/format";
import { isInTransitTab } from "@/lib/seller/shipment-timeline";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/utils/formatDate";
import { useLocationStore } from "@/store/locationStore";
import type { SellerShipment, ShipmentTab } from "@/types/seller";
import type {
  BackendDispatchStatus,
  SellerDispatchRecord,
  SellerDispatchTabFilter,
} from "@/types/seller-dispatch";
import {
  DISPATCH_STATUS_LABELS,
  DISPATCH_TAB_EMPTY,
} from "@/types/seller-dispatch";

const DISPATCH_FILTERS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready for Dispatch" },
  { key: "scheduled", label: "Scheduled" },
  { key: "loading", label: "Loading" },
  { key: "dispatched", label: "Dispatched" },
] as const satisfies ReadonlyArray<{
  key: SellerDispatchTabFilter;
  label: string;
}>;

type DispatchActionKey =
  | "schedule"
  | "assign"
  | "eway"
  | "start_loading"
  | "complete_loading"
  | "dispatch"
  | "view";

const EMPTY_SHIPMENTS: SellerShipment[] = [];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function formatSlotDisplay(item: SellerDispatchRecord): string {
  if (item.slotLabel) {
    const raw = item.slot?.slotDate;
    if (raw) {
      const datePart = formatDate(raw.slice(0, 10), "dd MMM yyyy");
      const timePart =
        item.slot?.timeSlot ||
        (item.slot?.startTime && item.slot?.endTime
          ? `${item.slot.startTime} - ${item.slot.endTime}`
          : item.slot?.startTime);
      return timePart ? `${datePart}\n${timePart}` : datePart;
    }
    return item.slotLabel;
  }
  if (item.plannedDispatchDate) {
    return formatDateTime(item.plannedDispatchDate);
  }
  return "Not scheduled";
}

function getDispatchPrimaryAction(item: SellerDispatchRecord): {
  key: DispatchActionKey;
  label: string;
} {
  switch (item.status) {
    case "DRAFT":
    case "PLANNED":
    case "AWAITING_VEHICLE":
      return item.vehicleSlotId
        ? { key: "assign", label: "Assign Vehicle" }
        : { key: "schedule", label: "Schedule" };
    case "VEHICLE_ASSIGNED":
      return { key: "eway", label: "Generate E-Way" };
    case "AWAITING_EWAY_BILL":
      return item.ewayBillNumber
        ? { key: "start_loading", label: "Start Loading" }
        : { key: "eway", label: "Generate E-Way" };
    case "READY_FOR_DISPATCH":
      return { key: "start_loading", label: "Start Loading" };
    case "LOADING":
      return { key: "complete_loading", label: "Complete Loading" };
    case "LOADED":
      return { key: "dispatch", label: "Mark Dispatched" };
    case "DISPATCHED":
    case "CANCELLED":
    default:
      return { key: "view", label: "View" };
  }
}

function DispatchTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse gap-4 border-t border-slate-100 px-4 py-4 first:border-t-0"
          >
            <div className="h-4 w-28 rounded bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="h-4 w-16 rounded bg-slate-100" />
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-4 flex-1 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SellerDispatchView({
  initialDispatchId,
}: {
  initialDispatchId?: string;
} = {}) {
  const router = useRouter();
  const [tab, setTab] = useState<SellerDispatchTabFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(
    initialDispatchId ?? null,
  );
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [ewayId, setEwayId] = useState<string | null>(null);
  const [ewayNumber, setEwayNumber] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const listParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      tab: tab === "all" ? ("all" as const) : tab,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [debouncedSearch, page, tab],
  );

  const listQuery = useSellerDispatches(listParams);
  const summaryQuery = useSellerDispatchSummary();
  const detailQuery = useSellerDispatch(detailId, Boolean(detailId));
  const timelineQuery = useSellerDispatchTimeline(detailId, Boolean(detailId));
  const vehiclesQuery = useLogisticsVehicles(undefined, Boolean(vehicleId));
  const driversQuery = useLogisticsDrivers(Boolean(vehicleId));

  const assignMutation = useAssignDispatchVehicle();
  const ewayMutation = useUpsertDispatchEway();
  const startLoadingMutation = useStartDispatchLoading();
  const completeLoadingMutation = useCompleteDispatchLoading();
  const executeMutation = useExecuteSellerDispatch();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open detail from deep link
    if (initialDispatchId) setDetailId(initialDispatchId);
  }, [initialDispatchId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination on filter change
    setPage(1);
  }, [tab, debouncedSearch]);

  const rows = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const tabCounts = summaryQuery.data?.byTab ?? {
    all: 0,
    ready: 0,
    scheduled: 0,
    loading: 0,
    dispatched: 0,
  };
  const detail =
    detailQuery.data ?? rows.find((r) => r.id === detailId) ?? null;
  const mutating =
    assignMutation.isPending ||
    ewayMutation.isPending ||
    startLoadingMutation.isPending ||
    completeLoadingMutation.isPending ||
    executeMutation.isPending;

  const runAction = async (
    item: SellerDispatchRecord,
    key: DispatchActionKey,
  ) => {
    try {
      if (key === "view") {
        setDetailId(item.id);
        return;
      }
      if (key === "schedule") {
        const qs = new URLSearchParams({
          orderId: item.purchaseOrderReference ?? item.purchaseOrderId,
          dispatchId: item.id,
        });
        router.push(`${ROUTES.VEHICLE_SLOTS}?${qs.toString()}`);
        return;
      }
      if (key === "assign") {
        setSelectedVehicleId(item.vehicleId ?? "");
        setSelectedDriverId(item.driverId ?? "");
        setVehicleId(item.id);
        return;
      }
      if (key === "eway") {
        setEwayNumber(item.ewayBillNumber ?? "");
        setEwayId(item.id);
        return;
      }
      if (key === "start_loading") {
        await startLoadingMutation.mutateAsync(item.id);
        toast.success("Loading started");
        return;
      }
      if (key === "complete_loading") {
        await completeLoadingMutation.mutateAsync(item.id);
        toast.success("Loading completed");
        return;
      }
      if (key === "dispatch") {
        await executeMutation.mutateAsync(item.id);
        toast.success("Dispatch executed");
      }
    } catch (error) {
      toast.error(dispatchApiError(error));
    }
  };

  const handleRefresh = async () => {
    await Promise.all([listQuery.refetch(), summaryQuery.refetch()]);
    toast.success("Dispatch queue updated");
  };

  const loading = listQuery.isLoading && rows.length === 0;
  const error = listQuery.isError
    ? dispatchApiError(listQuery.error)
    : summaryQuery.isError
      ? dispatchApiError(summaryQuery.error)
      : null;

  return (
    <PageContainer>
      <PageHeader
        title="Dispatch"
        description="Schedule loading and mark dispatches for your orders."
        actions={
          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={() => void handleRefresh()}
            disabled={listQuery.isFetching || summaryQuery.isFetching}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (listQuery.isFetching || summaryQuery.isFetching) &&
                  "animate-spin",
              )}
            />
            Refresh
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search PO, dispatch number, or vehicle..."
          className="max-w-lg"
        />
      </div>

      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        <div className="flex min-w-max gap-1">
          {DISPATCH_FILTERS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#1B6EF3] text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  {summaryQuery.isLoading ? "—" : tabCounts[item.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <ErrorState
          title={error}
          onRetry={() => {
            void listQuery.refetch();
            void summaryQuery.refetch();
          }}
        />
      ) : loading ? (
        <DispatchTableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          title={DISPATCH_TAB_EMPTY[tab]}
          description="Orders ready for loading will appear here once payment is cleared and a dispatch is created."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Loading Location</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const primary = getDispatchPrimaryAction(item);
                  return (
                    <tr
                      key={item.id}
                      className="cursor-pointer border-t hover:bg-slate-50/80"
                      onClick={() => setDetailId(item.id)}
                    >
                      <td className="px-4 py-3 font-medium">
                        <div>
                          <p>
                            {item.purchaseOrderReference ??
                              item.purchaseOrderId}
                          </p>
                          <p className="text-xs font-normal text-slate-400">
                            {item.dispatchNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.gradeName ?? item.dispatchNumber}
                      </td>
                      <td className="px-4 py-3">{formatMt(item.quantity)}</td>
                      <td className="px-4 py-3">{item.buyer.displayName}</td>
                      <td className="px-4 py-3">
                        {item.vehicleNumber ? (
                          <div>
                            <p className="font-medium text-slate-800">
                              {item.vehicleNumber}
                            </p>
                            {item.transporterName ? (
                              <p className="text-xs text-slate-400">
                                {item.transporterName}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.loadingLocation ?? "—"}
                      </td>
                      <td className="whitespace-pre-line px-4 py-3 text-slate-700">
                        {formatSlotDisplay(item)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <SellerStatusBadge status={item.status} />
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant={
                              primary.key === "view" ? "outline" : "default"
                            }
                            className="h-8 px-3 text-xs"
                            disabled={mutating}
                            onClick={() => void runAction(item, primary.key)}
                          >
                            {primary.label}
                          </Button>
                          {item.status !== "DISPATCHED" &&
                          item.status !== "CANCELLED" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  aria-label={`More actions for ${item.dispatchNumber}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  onClick={() => void runAction(item, "view")}
                                >
                                  <Eye className="h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    void runAction(item, "schedule")
                                  }
                                >
                                  <CalendarClock className="h-4 w-4" />
                                  Schedule / Vehicle Slot
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => void runAction(item, "assign")}
                                >
                                  <Truck className="h-4 w-4" />
                                  Assign Vehicle
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => void runAction(item, "eway")}
                                >
                                  <FileText className="h-4 w-4" />
                                  Generate E-Way Bill
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    void runAction(item, "start_loading")
                                  }
                                >
                                  <PackageCheck className="h-4 w-4" />
                                  Start Loading
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    void runAction(item, "complete_loading")
                                  }
                                >
                                  <PackageCheck className="h-4 w-4" />
                                  Complete Loading
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    void runAction(item, "dispatch")
                                  }
                                >
                                  <Truck className="h-4 w-4" />
                                  Mark Dispatched
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>
                Showing{" "}
                <span className="font-medium text-slate-900">
                  {rows.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {pagination.total}
                </span>{" "}
                dispatches
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || listQuery.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="tabular-nums">
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= pagination.totalPages || listQuery.isFetching
                  }
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <DetailDrawer
        open={Boolean(detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        title={
          detail?.purchaseOrderReference ?? detail?.dispatchNumber ?? "Dispatch"
        }
        footer={
          detail &&
          detail.status !== "DISPATCHED" &&
          detail.status !== "CANCELLED" ? (
            <Button
              className="w-full"
              disabled={mutating}
              onClick={() => {
                void runAction(detail, getDispatchPrimaryAction(detail).key);
              }}
            >
              {getDispatchPrimaryAction(detail).label}
            </Button>
          ) : null
        }
      >
        {detailQuery.isLoading && !detail ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-slate-100" />
            ))}
          </div>
        ) : detail ? (
          <div className="space-y-5">
            <dl className="space-y-3 text-sm">
              <DispatchDetailRow
                label="Dispatch number"
                value={detail.dispatchNumber}
              />
              <DispatchDetailRow
                label="Purchase order"
                value={detail.purchaseOrderReference ?? detail.purchaseOrderId}
              />
              <DispatchDetailRow
                label="Grade"
                value={detail.gradeName ?? "—"}
              />
              <DispatchDetailRow
                label="Quantity"
                value={formatMt(detail.quantity)}
              />
              <DispatchDetailRow
                label="Buyer"
                value={detail.buyer.displayName}
              />
              <DispatchDetailRow
                label="Loading location"
                value={detail.loadingLocation ?? "—"}
              />
              <DispatchDetailRow
                label="Slot"
                value={formatSlotDisplay(detail).replace("\n", " · ")}
              />
              <DispatchDetailRow
                label="Vehicle"
                value={detail.vehicleNumber ?? "Unassigned"}
              />
              <DispatchDetailRow
                label="Vehicle type"
                value={detail.vehicleType ?? "—"}
              />
              <DispatchDetailRow
                label="Transporter"
                value={detail.transporterName ?? "—"}
              />
              <DispatchDetailRow
                label="Driver"
                value={detail.driverName ?? "—"}
              />
              <DispatchDetailRow
                label="E-Way Bill"
                value={detail.ewayBillNumber ?? "Not generated"}
              />
              <DispatchDetailRow
                label="Planned dispatch"
                value={
                  detail.plannedDispatchDate
                    ? formatDateTime(detail.plannedDispatchDate)
                    : "—"
                }
              />
              <DispatchDetailRow
                label="Actual dispatch"
                value={
                  detail.actualDispatchDate
                    ? formatDateTime(detail.actualDispatchDate)
                    : "—"
                }
              />
              <div>
                <dt className="text-xs uppercase text-slate-500">Status</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <SellerStatusBadge status={detail.status} />
                  <span className="text-xs text-slate-500">
                    {DISPATCH_STATUS_LABELS[
                      detail.status as BackendDispatchStatus
                    ] ?? detail.status}
                  </span>
                </dd>
              </div>
              {detail.shipmentId ? (
                <div>
                  <dt className="text-xs uppercase text-slate-500">Shipment</dt>
                  <dd className="mt-1">
                    <Link
                      href={`${ROUTES.SHIPMENTS}?id=${detail.shipmentId}`}
                      className="text-sm font-medium text-[#1B6EF3] hover:underline"
                    >
                      View shipment
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Timeline
              </h3>
              {timelineQuery.isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-8 rounded bg-slate-100" />
                  <div className="h-8 rounded bg-slate-100" />
                </div>
              ) : (timelineQuery.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">
                  No timeline events yet.
                </p>
              ) : (
                <ol className="space-y-3 border-l border-slate-200 pl-4">
                  {(timelineQuery.data ?? []).map((event) => (
                    <li key={event.id} className="relative text-sm">
                      <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[#1B6EF3]" />
                      <p className="font-medium text-slate-800">
                        {event.eventType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(event.occurredAt)}
                        {event.actorRole ? ` · ${event.actorRole}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ) : null}
      </DetailDrawer>

      <DetailDrawer
        open={Boolean(vehicleId)}
        onOpenChange={(open) => {
          if (!open) setVehicleId(null);
        }}
        title="Assign vehicle"
        footer={
          <Button
            className="w-full"
            disabled={!selectedVehicleId || assignMutation.isPending}
            onClick={() => {
              if (!vehicleId || !selectedVehicleId) return;
              void assignMutation
                .mutateAsync({
                  id: vehicleId,
                  payload: {
                    vehicleId: selectedVehicleId,
                    driverId: selectedDriverId || undefined,
                  },
                })
                .then(() => {
                  toast.success("Vehicle assigned");
                  setVehicleId(null);
                })
                .catch((error) => toast.error(dispatchApiError(error)));
            }}
          >
            {assignMutation.isPending ? "Saving..." : "Save"}
          </Button>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-500">
              Vehicle
            </label>
            <Select
              value={selectedVehicleId || undefined}
              onValueChange={setSelectedVehicleId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    vehiclesQuery.isLoading
                      ? "Loading vehicles..."
                      : "Select vehicle"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(vehiclesQuery.data ?? []).map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.numberPlate}
                    {vehicle.transporterName
                      ? ` · ${vehicle.transporterName}`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-500">
              Driver (optional)
            </label>
            <Select
              value={selectedDriverId || undefined}
              onValueChange={setSelectedDriverId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    driversQuery.isLoading
                      ? "Loading drivers..."
                      : "Select driver"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(driversQuery.data ?? []).map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                    {driver.phone ? ` · ${driver.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DetailDrawer>

      <DetailDrawer
        open={Boolean(ewayId)}
        onOpenChange={(open) => {
          if (!open) setEwayId(null);
        }}
        title="E-Way Bill"
        footer={
          <Button
            className="w-full"
            disabled={!ewayNumber.trim() || ewayMutation.isPending}
            onClick={() => {
              if (!ewayId || !ewayNumber.trim()) return;
              void ewayMutation
                .mutateAsync({
                  id: ewayId,
                  payload: { ewayBillNumber: ewayNumber.trim() },
                })
                .then(() => {
                  toast.success("E-Way Bill saved");
                  setEwayId(null);
                })
                .catch((error) => toast.error(dispatchApiError(error)));
            }}
          >
            {ewayMutation.isPending ? "Saving..." : "Save E-Way Bill"}
          </Button>
        }
      >
        <div className="space-y-3">
          <Input
            value={ewayNumber}
            onChange={(e) => setEwayNumber(e.target.value)}
            placeholder="E-Way Bill number"
          />
          <p className="text-xs text-slate-500">
            Enter the e-way bill number issued for this dispatch. Document
            upload uses the existing R2-backed logistics flow.
          </p>
        </div>
      </DetailDrawer>
    </PageContainer>
  );
}

function DispatchDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

export function SellerShipmentsView({
  initialShipmentId,
}: {
  initialShipmentId?: string;
}) {
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const [tab, setTab] = useState<ShipmentTab>("IN_TRANSIT");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialShipmentId ?? null,
  );
  const [deepLink, setDeepLink] = useState<SellerShipment | null>(null);
  const { data, loading, error, retry } = useAsyncResource(
    () => getShipmentsByLocation(locationId),
    [locationId],
    "Unable to load shipments.",
  );
  const all = data ?? EMPTY_SHIPMENTS;
  const rows = useMemo(
    () =>
      all.filter((item) =>
        tab === "DELIVERED"
          ? item.status === "DELIVERED"
          : isInTransitTab(item.status),
      ),
    [all, tab],
  );
  const selected =
    all.find((item) => item.id === selectedId) ??
    (deepLink?.id === selectedId ? deepLink : null);

  useEffect(() => {
    if (!initialShipmentId) return;
    void getShipmentById(initialShipmentId).then((item) => {
      if (!item) return;
      setDeepLink(item);
      setTab(item.status === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT");
    });
  }, [initialShipmentId]);

  if (loading) {
    return (
      <PageContainer>
        <ShipmentPageSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Shipment Tracking"
          description="Dispatch status for in-transit and delivered loads."
        />
        <ErrorState title={error} onRetry={retry} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Shipment Tracking"
        description="Dispatch status for in-transit and delivered loads."
      />
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Tracking is based on dispatch milestones. Live GPS is not available.
      </p>
      <ShipmentStatusTabs value={tab} onChange={setTab} />
      {rows.length === 0 ? (
        <ShipmentEmptyState />
      ) : (
        <>
          <ShipmentTable shipments={rows} onOpenShipment={setSelectedId} />
          <ShipmentCards shipments={rows} onOpenShipment={setSelectedId} />
        </>
      )}
      <ShipmentDetailDrawer
        shipment={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </PageContainer>
  );
}
