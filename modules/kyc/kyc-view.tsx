"use client";

import {
  CheckCircle2,
  FileCheck2,
  MoreHorizontal,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog } from "@/components/cx";
import { CustomerDocsDrawer } from "@/components/kyc";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/customerStore";
import type { CustomerKycStatus, CustomerProfile } from "@/types/customers";

function DocProgress({ customer }: { customer: CustomerProfile }) {
  const total = customer.documents.length;
  const verified = customer.documents.filter(
    (doc) => doc.status === "VERIFIED",
  ).length;
  const pending = customer.documents.filter(
    (doc) => doc.status === "PENDING" || doc.status === "UNDER_REVIEW",
  ).length;
  const rejected = customer.documents.filter(
    (doc) => doc.status === "REJECTED",
  ).length;
  const pct = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium tabular-nums text-slate-800">
          {verified}/{total}
        </span>
        {pending > 0 ? (
          <span className="text-amber-600">{pending} pending</span>
        ) : rejected > 0 ? (
          <span className="text-red-600">{rejected} rejected</span>
        ) : total > 0 ? (
          <span className="text-emerald-600">Complete</span>
        ) : (
          <span className="text-slate-400">None</span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct === 100
              ? "bg-emerald-500"
              : rejected > 0
                ? "bg-red-400"
                : "bg-[#1B6EF3]",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function KycView() {
  const params = useSearchParams();
  const statusParam = params.get("status")?.toUpperCase() ?? "ALL";
  const customerParam = params.get("customer");
  const customers = useCustomerStore((s) => s.customers);
  const getCustomer = useCustomerStore((s) => s.getCustomer);
  const setKycStatus = useCustomerStore((s) => s.setKycStatus);
  const [pending, setPending] = useState<{
    id: string;
    status: CustomerKycStatus;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [syncedCustomerParam, setSyncedCustomerParam] = useState<string | null>(
    null,
  );

  if (customerParam !== syncedCustomerParam) {
    setSyncedCustomerParam(customerParam);
    if (customerParam) {
      const match = getCustomer(customerParam);
      if (match) setViewCustomerId(match.id);
    }
  }

  const searchFields = useMemo(
    () => (row: CustomerProfile) => [
      row.name,
      row.companyName,
      row.customerId,
      row.gstin,
      row.kycStatus,
    ],
    [],
  );
  const table = useClientTable({
    rows: customers,
    searchFields,
    initialStatus: [
      "ALL",
      "PENDING",
      "UNDER_REVIEW",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED",
    ].includes(statusParam)
      ? statusParam
      : "ALL",
    getStatus: (row) => row.kycStatus,
  });

  const viewCustomer = viewCustomerId
    ? (customers.find((row) => row.id === viewCustomerId) ?? null)
    : null;

  const pendingCount = customers.filter(
    (row) => row.kycStatus === "PENDING" || row.kycStatus === "UNDER_REVIEW",
  ).length;
  const verifiedCount = customers.filter(
    (row) => row.kycStatus === "VERIFIED",
  ).length;
  const rejectedCount = customers.filter(
    (row) => row.kycStatus === "REJECTED",
  ).length;

  return (
    <OperationsShell
      title="KYC desk"
      subtitle="Review customer onboarding documents from Customer APP/WEB. Open Review to verify each upload."
      kpis={[
        {
          title: "Needs review",
          value: pendingCount,
          accent: "amber",
          hint: "Pending or under review",
        },
        {
          title: "Verified",
          value: verifiedCount,
          accent: "emerald",
        },
        {
          title: "Rejected",
          value: rejectedCount,
          accent: "rose",
        },
      ]}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search name, company, GSTIN…"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "PENDING",
          "UNDER_REVIEW",
          "VERIFIED",
          "REJECTED",
          "SUSPENDED",
        ]}
        headers={[
          "Customer",
          "GSTIN",
          "Type",
          "Documents",
          "Status",
          "Actions",
        ]}
        emptyTitle="No customer KYC"
        emptyDescription="No customer KYC records match the selected filters."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id} className="align-top">
            <TableCell>
              <button
                type="button"
                onClick={() => setViewCustomerId(row.id)}
                className="group block max-w-[240px] text-left"
              >
                <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#1B6EF3]">
                  {row.name}
                </p>
                <p
                  className="mt-0.5 truncate text-xs text-slate-500"
                  title={row.companyName}
                >
                  {row.companyName}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#1B6EF3]">
                  {row.customerId}
                </p>
              </button>
            </TableCell>
            <TableCell>
              <p className="font-mono text-xs text-slate-700">{row.gstin}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {row.city}, {row.state}
              </p>
            </TableCell>
            <TableCell>
              <span className="text-sm capitalize text-slate-700">
                {row.customerType.toLowerCase()}
              </span>
            </TableCell>
            <TableCell>
              <DocProgress customer={row} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.kycStatus} />
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setViewCustomerId(row.id)}
                >
                  <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
                  Review
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-slate-500"
                      aria-label={`More actions for ${row.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link href={`${ROUTES.CUSTOMERS}/${row.id}`}>
                        View customer profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setPending({ id: row.id, status: "VERIFIED" })
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                      Approve KYC
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setPending({ id: row.id, status: "PENDING" })
                      }
                    >
                      <RotateCcw className="mr-2 h-4 w-4 text-amber-600" />
                      Request correction
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-700"
                      onClick={() =>
                        setPending({ id: row.id, status: "REJECTED" })
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject KYC
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CustomerDocsDrawer
        open={Boolean(viewCustomer)}
        customer={viewCustomer}
        onClose={() => setViewCustomerId(null)}
      />

      <ConfirmActionDialog
        open={Boolean(pending)}
        title={
          pending?.status === "VERIFIED"
            ? "Approve customer KYC?"
            : pending?.status === "REJECTED"
              ? "Reject customer KYC?"
              : "Request KYC correction?"
        }
        description="The customer will see the outcome. Internal underwriting notes remain admin-only."
        reasonRequired={pending?.status === "REJECTED"}
        reason={reason}
        onReasonChange={setReason}
        destructive={pending?.status === "REJECTED"}
        onCancel={() => {
          setPending(null);
          setReason("");
        }}
        onConfirm={async () => {
          if (!pending) return;
          await setKycStatus(pending.id, pending.status, reason);
          toast.success("KYC updated");
          setPending(null);
          setReason("");
        }}
      />
    </OperationsShell>
  );
}
