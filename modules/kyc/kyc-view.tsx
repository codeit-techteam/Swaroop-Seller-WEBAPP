"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog } from "@/components/cx";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { kycRecordsMock } from "@/mock/kyc";
import { useCustomerStore } from "@/store/customerStore";
import type { CustomerKycStatus, CustomerProfile } from "@/types/customers";

export function KycView() {
  const params = useSearchParams();
  const statusParam = params.get("status")?.toUpperCase() ?? "ALL";
  const customers = useCustomerStore((s) => s.customers);
  const setKycStatus = useCustomerStore((s) => s.setKycStatus);
  const [pending, setPending] = useState<{
    id: string;
    status: CustomerKycStatus;
  } | null>(null);
  const [reason, setReason] = useState("");
  const searchFields = useMemo(
    () => (row: CustomerProfile) => [
      row.name,
      row.companyName,
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
  const deskSearch = useMemo(
    () => (row: (typeof kycRecordsMock)[number]) => [
      row.entity,
      row.document,
      row.status,
    ],
    [],
  );
  const desk = useClientTable({
    rows: kycRecordsMock,
    searchFields: deskSearch,
  });

  return (
    <OperationsShell
      title="KYC desk"
      subtitle="Customer onboarding review for Customer APP/WEB. Internal reviewer notes stay on this desk."
      kpis={[
        {
          title: "Pending customers",
          value: customers.filter(
            (row) =>
              row.kycStatus === "PENDING" || row.kycStatus === "UNDER_REVIEW",
          ).length,
        },
        {
          title: "Verified",
          value: customers.filter((row) => row.kycStatus === "VERIFIED").length,
        },
      ]}
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search customer KYC"
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
        headers={["Customer", "Company", "GSTIN", "Type", "Status", "Actions"]}
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
          <TableRow key={row.id}>
            <TableCell>
              <Link
                href={`${ROUTES.CUSTOMERS}/${row.id}`}
                className="font-medium text-[#1B6EF3] hover:underline"
              >
                {row.name}
              </Link>
            </TableCell>
            <TableCell>{row.companyName}</TableCell>
            <TableCell className="font-mono text-xs">{row.gstin}</TableCell>
            <TableCell>{row.customerType}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.kycStatus} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setPending({ id: row.id, status: "VERIFIED" })}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setPending({ id: row.id, status: "PENDING" })}
                >
                  Correction
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-red-600"
                  onClick={() => setPending({ id: row.id, status: "REJECTED" })}
                >
                  Reject
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <div className="pt-2">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Entity documents
        </h2>
        <OpsTable
          search={desk.search}
          onSearch={desk.setSearch}
          searchPlaceholder="Search entity or document"
          status={desk.status}
          onStatusChange={desk.setStatus}
          statusOptions={[
            "ALL",
            "VERIFIED",
            "PENDING",
            "EXPIRED",
            "REJECTED",
            "UNDER_REVIEW",
          ]}
          headers={["Entity", "Type", "Document", "Submitted", "Status"]}
          emptyTitle="No compliance documents"
          emptyDescription="No KYC records match the selected filters."
          page={desk.page}
          totalPages={desk.totalPages}
          totalItems={desk.filtered.length}
          pageSize={desk.pageSize}
          onPageChange={desk.setPage}
          rowCount={desk.paginated.length}
        >
          {desk.paginated.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.entity}</TableCell>
              <TableCell>{row.entityType}</TableCell>
              <TableCell>{row.document}</TableCell>
              <TableCell>{row.submittedAt}</TableCell>
              <TableCell>
                <OpsStatusBadge status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </OpsTable>
      </div>

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
