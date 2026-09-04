"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common/empty-state";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { DetailDrawer } from "@/components/drawers/detail-drawer";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { formatMt, formatPricePerKg } from "@/lib/seller/format";
import { formatDateTime } from "@/lib/utils";
import { useLocationStore } from "@/store/locationStore";
import { useSellerRequestStore } from "@/store/sellerRequestStore";
import { useSellerStore } from "@/store/sellerStore";

const REQUEST_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "counter_sent", label: "Counter Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
] as const;

export function SellerRequestsView() {
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const requests = useSellerRequestStore((s) => s.requests);
  const search = useSellerRequestStore((s) => s.search);
  const setSearch = useSellerRequestStore((s) => s.setSearch);
  const status = useSellerRequestStore((s) => s.status);
  const setStatus = useSellerRequestStore((s) => s.setStatus);
  const selectedId = useSellerRequestStore((s) => s.selectedId);
  const drawerOpen = useSellerRequestStore((s) => s.drawerOpen);
  const openDrawer = useSellerRequestStore((s) => s.openDrawer);
  const closeDrawer = useSellerRequestStore((s) => s.closeDrawer);
  const accept = useSellerRequestStore((s) => s.accept);
  const reject = useSellerRequestStore((s) => s.reject);
  const counter = useSellerRequestStore((s) => s.counter);
  const addActivity = useSellerStore((s) => s.addActivity);
  const [counterOpen, setCounterOpen] = useState(false);
  const [price, setPrice] = useState("0");
  const [qty, setQty] = useState("0");
  const [validity, setValidity] = useState("24 hours");
  const [remark, setRemark] = useState("");

  const rows = useMemo(
    () =>
      requests.filter((item) => {
        if (item.locationId !== locationId) return false;
        if (status !== "all" && item.status !== status) return false;
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
          item.requestNumber.toLowerCase().includes(query) ||
          item.gradeName.toLowerCase().includes(query)
        );
      }),
    [locationId, requests, search, status],
  );
  const selected = requests.find((item) => item.id === selectedId);

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Requests"
        description="Incoming buyer requests. Identity stays limited until the deal progresses."
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search request or grade"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_STATUS_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No purchase requests"
          description="Live offers will start attracting buyer requests."
          action={
            <Button asChild>
              <Link href={ROUTES.OFFERS}>Browse My Offers</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Requested price</th>
                <th className="px-4 py-3">Received</th>
                <th className="min-w-[140px] whitespace-nowrap px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium">
                    {item.requestNumber}
                  </td>
                  <td className="px-4 py-3">{item.gradeName}</td>
                  <td className="px-4 py-3">{formatMt(item.quantityMt)}</td>
                  <td className="px-4 py-3">
                    <div>{item.buyerLabel}</div>
                    <div className="text-xs text-slate-400">{item.buyerId}</div>
                  </td>
                  <td className="px-4 py-3">{item.deliveryLocation}</td>
                  <td className="px-4 py-3">
                    {formatPricePerKg(item.requestedPrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {formatDateTime(item.receivedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <SellerStatusBadge status={item.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => openDrawer(item.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(open) => !open && closeDrawer()}
        title={selected?.requestNumber ?? "Request"}
        footer={
          selected &&
          (selected.status === "new" || selected.status === "under_review") ? (
            <div className="flex flex-nowrap gap-2">
              <Button
                className="flex-1 whitespace-nowrap"
                onClick={() => {
                  accept(selected.id);
                  addActivity({
                    type: "request",
                    title: "Purchase request accepted",
                    description: selected.requestNumber,
                  });
                  toast.success("Purchase request accepted");
                  closeDrawer();
                }}
              >
                Accept
              </Button>
              <Button
                className="flex-1 whitespace-nowrap"
                variant="outline"
                onClick={() => {
                  setPrice(String(selected.requestedPrice));
                  setQty(String(selected.quantityMt));
                  setCounterOpen(true);
                }}
              >
                Counter Offer
              </Button>
              <Button
                className="flex-1 whitespace-nowrap"
                variant="destructive"
                onClick={() => {
                  reject(selected.id);
                  toast.success("Request rejected");
                  closeDrawer();
                }}
              >
                Reject
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <dl className="space-y-3 text-sm">
            <Row label="Grade" value={selected.gradeName} />
            <Row label="Quantity" value={formatMt(selected.quantityMt)} />
            <Row
              label="Requested price"
              value={formatPricePerKg(selected.requestedPrice)}
            />
            <Row label="Delivery" value={selected.deliveryLocation} />
            <Row label="Delivery date" value={selected.requestedDeliveryDate} />
            <Row label="Payment terms" value={selected.paymentTerms} />
            <Row
              label="Buyer"
              value={`${selected.buyerLabel} (${selected.buyerId})`}
            />
            <Row label="Notes" value={selected.notes} />
            <Row label="Status" value={selected.status} />
          </dl>
        ) : null}
      </DetailDrawer>

      <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Your Price</Label>
              <Input
                className="mt-1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                className="mt-1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <Label>Validity</Label>
              <Input
                className="mt-1"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
              />
            </div>
            <div>
              <Label>Remark</Label>
              <Input
                className="mt-1"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!selected) return;
                counter(selected.id, {
                  price: Number(price),
                  quantity: Number(qty),
                  validity,
                  remark,
                });
                toast.success("Counter offer sent");
                setCounterOpen(false);
                closeDrawer();
              }}
            >
              Send counter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
