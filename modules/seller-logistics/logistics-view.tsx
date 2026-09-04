"use client";

import {
  CalendarClock,
  Eye,
  FileText,
  MoreHorizontal,
  PackageCheck,
  Truck,
} from "lucide-react";
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
import { useAsyncResource } from "@/hooks/useAsyncResource";
import {
  getShipmentById,
  getShipmentsByLocation,
} from "@/lib/repositories/shipments";
import { formatMt } from "@/lib/seller/format";
import { isInTransitTab } from "@/lib/seller/shipment-timeline";
import { cn } from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";
import { useSellerOrderStore } from "@/store/sellerOrderStore";
import type {
  SellerDispatch,
  SellerShipment,
  ShipmentTab,
} from "@/types/seller";

const DISPATCH_FILTERS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready for Dispatch" },
  { key: "scheduled", label: "Scheduled" },
  { key: "loading", label: "Loading" },
  { key: "dispatched", label: "Dispatched" },
] as const;

type DispatchFilter = (typeof DISPATCH_FILTERS)[number]["key"];
type DispatchActionKey =
  "schedule" | "assign" | "eway" | "load" | "dispatch" | "view";

const EMPTY_SHIPMENTS: SellerShipment[] = [];

function getDispatchPrimaryAction(item: SellerDispatch): {
  key: DispatchActionKey;
  label: string;
} {
  if (item.status === "ready") return { key: "schedule", label: "Schedule" };
  if (item.status === "scheduled" && !item.vehicle) {
    return { key: "assign", label: "Assign Vehicle" };
  }
  if (item.status === "scheduled" && !item.ewayBill) {
    return { key: "eway", label: "Generate E-Way" };
  }
  if (item.status === "scheduled") return { key: "load", label: "Mark Loaded" };
  if (item.status === "loading") {
    return { key: "dispatch", label: "Mark Dispatched" };
  }
  return { key: "view", label: "View" };
}

export function SellerDispatchView() {
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const dispatches = useSellerOrderStore((s) => s.dispatches);
  const scheduleDispatch = useSellerOrderStore((s) => s.scheduleDispatch);
  const assignVehicle = useSellerOrderStore((s) => s.assignVehicle);
  const markDispatchStatus = useSellerOrderStore((s) => s.markDispatchStatus);
  const generateEwayBill = useSellerOrderStore((s) => s.generateEwayBill);
  const rowsAll = useMemo(
    () => dispatches.filter((item) => item.locationId === locationId),
    [dispatches, locationId],
  );
  const [tab, setTab] = useState<DispatchFilter>("all");
  const rows = useMemo(
    () =>
      tab === "all" ? rowsAll : rowsAll.filter((item) => item.status === tab),
    [rowsAll, tab],
  );
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState("TN-09-AB-1001");
  const [transporter, setTransporter] = useState("South Freight");
  const [driver, setDriver] = useState("Ramesh");
  const detail = rowsAll.find((item) => item.id === detailId);

  const tabCounts = useMemo(() => {
    const counts: Record<DispatchFilter, number> = {
      all: rowsAll.length,
      ready: 0,
      scheduled: 0,
      loading: 0,
      dispatched: 0,
    };
    for (const item of rowsAll) {
      counts[item.status] += 1;
    }
    return counts;
  }, [rowsAll]);

  const runAction = (item: SellerDispatch, key: DispatchActionKey) => {
    if (key === "schedule") {
      scheduleDispatch(item.id, new Date().toISOString().slice(0, 10));
      toast.success("Dispatch scheduled");
      return;
    }
    if (key === "assign") {
      setVehicle(item.vehicle ?? "TN-09-AB-1001");
      setTransporter(item.transporter ?? "South Freight");
      setDriver(item.driver ?? "Ramesh");
      setVehicleId(item.id);
      return;
    }
    if (key === "eway") {
      const ref = generateEwayBill(item.id);
      toast.success(`E-Way Bill ${ref} generated`);
      return;
    }
    if (key === "load") {
      markDispatchStatus(item.id, "loading");
      toast.success("Marked loaded");
      return;
    }
    if (key === "dispatch") {
      markDispatchStatus(item.id, "dispatched");
      toast.success("Marked dispatched");
      return;
    }
    setDetailId(item.id);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Dispatch"
        description="Schedule loading and mark dispatches for your orders."
      />
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
                  {tabCounts[item.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No dispatch lots"
          description="Orders ready for loading will appear here."
        />
      ) : (
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
                    <td className="px-4 py-3 font-medium">{item.orderId}</td>
                    <td className="px-4 py-3">{item.gradeName}</td>
                    <td className="px-4 py-3">{formatMt(item.quantityMt)}</td>
                    <td className="px-4 py-3">{item.buyerRef ?? "—"}</td>
                    <td className="px-4 py-3">
                      {item.vehicle ? (
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.vehicle}
                          </p>
                          {item.transporter ? (
                            <p className="text-xs text-slate-400">
                              {item.transporter}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.loadingLocation}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {item.slot ?? item.scheduledDate}
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
                          onClick={() => runAction(item, primary.key)}
                        >
                          {primary.label}
                        </Button>
                        {item.status !== "dispatched" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                aria-label={`More actions for ${item.orderId}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem
                                onClick={() => runAction(item, "view")}
                              >
                                <Eye className="h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              {primary.key !== "schedule" ? (
                                <DropdownMenuItem
                                  onClick={() => runAction(item, "schedule")}
                                >
                                  <CalendarClock className="h-4 w-4" />
                                  Schedule Dispatch
                                </DropdownMenuItem>
                              ) : null}
                              {primary.key !== "assign" ? (
                                <DropdownMenuItem
                                  onClick={() => runAction(item, "assign")}
                                >
                                  <Truck className="h-4 w-4" />
                                  Assign Vehicle
                                </DropdownMenuItem>
                              ) : null}
                              {primary.key !== "eway" ? (
                                <DropdownMenuItem
                                  onClick={() => runAction(item, "eway")}
                                >
                                  <FileText className="h-4 w-4" />
                                  Generate E-Way Bill
                                </DropdownMenuItem>
                              ) : null}
                              {item.status !== "loading" &&
                              primary.key !== "load" ? (
                                <DropdownMenuItem
                                  onClick={() => runAction(item, "load")}
                                >
                                  <PackageCheck className="h-4 w-4" />
                                  Mark Loaded
                                </DropdownMenuItem>
                              ) : null}
                              {primary.key !== "dispatch" ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => runAction(item, "dispatch")}
                                  >
                                    <Truck className="h-4 w-4" />
                                    Mark Dispatched
                                  </DropdownMenuItem>
                                </>
                              ) : null}
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
      )}
      <DetailDrawer
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        title={detail?.orderId ?? "Dispatch"}
        footer={
          detail && detail.status !== "dispatched" ? (
            <Button
              className="w-full"
              onClick={() => {
                runAction(detail, getDispatchPrimaryAction(detail).key);
                setDetailId(null);
              }}
            >
              {getDispatchPrimaryAction(detail).label}
            </Button>
          ) : null
        }
      >
        {detail ? (
          <dl className="space-y-3 text-sm">
            <DispatchDetailRow label="Grade" value={detail.gradeName} />
            <DispatchDetailRow
              label="Quantity"
              value={formatMt(detail.quantityMt)}
            />
            <DispatchDetailRow label="Buyer" value={detail.buyerRef ?? "—"} />
            <DispatchDetailRow
              label="Loading location"
              value={detail.loadingLocation}
            />
            <DispatchDetailRow
              label="Slot"
              value={detail.slot ?? detail.scheduledDate}
            />
            <DispatchDetailRow
              label="Vehicle"
              value={detail.vehicle ?? "Unassigned"}
            />
            <DispatchDetailRow
              label="Transporter"
              value={detail.transporter ?? "—"}
            />
            <DispatchDetailRow label="Driver" value={detail.driver ?? "—"} />
            <DispatchDetailRow
              label="E-Way Bill"
              value={detail.ewayBill ?? "Not generated"}
            />
            <div>
              <dt className="text-xs uppercase text-slate-500">Status</dt>
              <dd className="mt-1">
                <SellerStatusBadge status={detail.status} />
              </dd>
            </div>
          </dl>
        ) : null}
      </DetailDrawer>
      <DetailDrawer
        open={Boolean(vehicleId)}
        onOpenChange={() => setVehicleId(null)}
        title="Assign vehicle"
        footer={
          <Button
            className="w-full"
            onClick={() => {
              if (!vehicleId) return;
              assignVehicle(vehicleId, vehicle, transporter, driver);
              toast.success("Vehicle assigned");
              setVehicleId(null);
            }}
          >
            Save
          </Button>
        }
      >
        <div className="space-y-3">
          <Input
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="Vehicle number"
          />
          <Input
            value={transporter}
            onChange={(e) => setTransporter(e.target.value)}
            placeholder="Transporter"
          />
          <Input
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            placeholder="Driver"
          />
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
