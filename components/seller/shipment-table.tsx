"use client";

import Link from "next/link";

import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { ROUTES } from "@/lib/constants";
import { formatMt } from "@/lib/seller/format";
import { formatDateTime } from "@/lib/utils";
import type { SellerShipment } from "@/types/seller";

const ETA_PATTERN = "dd/MM/yyyy, h:mm a";

interface ShipmentTableProps {
  shipments: SellerShipment[];
  onOpenShipment: (id: string) => void;
}

export function ShipmentTable({
  shipments,
  onOpenShipment,
}: ShipmentTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Shipment</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">ETA</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <Link
                  href={`${ROUTES.ORDERS}/${item.orderId}`}
                  className="font-medium text-[#1B6EF3] hover:underline"
                >
                  {item.orderId}
                </Link>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="font-medium text-[#1B6EF3] hover:underline"
                  onClick={() => onOpenShipment(item.id)}
                >
                  {item.id}
                </button>
              </td>
              <td className="px-4 py-3 text-slate-800">{item.grade}</td>
              <td className="px-4 py-3">{formatMt(item.quantity)}</td>
              <td className="px-4 py-3">{item.vehicleNumber}</td>
              <td className="px-4 py-3">{item.route}</td>
              <td className="px-4 py-3">
                <SellerStatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {formatDateTime(item.eta, ETA_PATTERN)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShipmentCards({
  shipments,
  onOpenShipment,
}: ShipmentTableProps) {
  return (
    <div className="grid gap-3 md:hidden">
      {shipments.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <button
                type="button"
                className="text-sm font-semibold text-[#1B6EF3]"
                onClick={() => onOpenShipment(item.id)}
              >
                {item.id}
              </button>
              <p className="mt-1 text-xs text-slate-500">{item.grade}</p>
            </div>
            <SellerStatusBadge status={item.status} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-slate-400">Order</dt>
              <dd>
                <Link
                  href={`${ROUTES.ORDERS}/${item.orderId}`}
                  className="font-medium text-[#1B6EF3]"
                >
                  {item.orderId}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Qty</dt>
              <dd className="font-medium">{formatMt(item.quantity)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Vehicle</dt>
              <dd className="font-medium">{item.vehicleNumber}</dd>
            </div>
            <div>
              <dt className="text-slate-400">ETA</dt>
              <dd className="font-medium">
                {formatDateTime(item.eta, ETA_PATTERN)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">{item.route}</p>
        </article>
      ))}
    </div>
  );
}
