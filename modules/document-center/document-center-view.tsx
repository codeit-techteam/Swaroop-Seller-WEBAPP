"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CustomerDocsDrawer } from "@/components/kyc";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { useCustomerStore } from "@/store/customerStore";
import type { CustomerProfile } from "@/types/customers";
import {
  CUSTOMER_DOCUMENT_TYPE_LABELS,
  ONBOARDING_DOCUMENT_TYPES,
} from "@/types/customers";

function docsPending(customer: CustomerProfile) {
  return customer.documents.filter(
    (doc) => doc.status === "PENDING" || doc.status === "UNDER_REVIEW",
  ).length;
}

function docsVerified(customer: CustomerProfile) {
  return customer.documents.filter((doc) => doc.status === "VERIFIED").length;
}

function lastUpload(customer: CustomerProfile) {
  if (!customer.documents.length) return "—";
  return [...customer.documents]
    .map((doc) => doc.uploadedAt)
    .sort()
    .at(-1)!;
}

export function DocumentCenterView() {
  const customers = useCustomerStore((s) => s.customers);
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);

  const allDocuments = useMemo(
    () => customers.flatMap((customer) => customer.documents),
    [customers],
  );

  const searchFields = useMemo(
    () => (row: CustomerProfile) => [
      row.name,
      row.companyName,
      row.customerId,
      row.gstin,
      ...row.documents.map((doc) => doc.name),
      ...row.documents.map((doc) => doc.type),
    ],
    [],
  );

  const table = useClientTable({
    rows: customers,
    searchFields,
    getStatus: (row) => row.kycStatus,
  });

  const viewCustomer = viewCustomerId
    ? (customers.find((row) => row.id === viewCustomerId) ?? null)
    : null;

  return (
    <OperationsShell
      title="Customer documents"
      subtitle="Onboarding documents uploaded from Customer APP/WEB — GST, PAN, Aadhaar, cheque and address proof. Review, verify, or request a fresh upload."
      kpis={[
        {
          title: "Pending verification",
          value: allDocuments.filter(
            (doc) =>
              doc.status === "PENDING" || doc.status === "UNDER_REVIEW",
          ).length,
        },
        {
          title: "Verified docs",
          value: allDocuments.filter((doc) => doc.status === "VERIFIED")
            .length,
        },
        {
          title: "Total documents",
          value: allDocuments.length,
        },
        {
          title: "Customers",
          value: customers.length,
        },
      ]}
    >
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Onboarding document types
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ONBOARDING_DOCUMENT_TYPES.map((type) => (
            <span
              key={type}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {CUSTOMER_DOCUMENT_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search customer or document"
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
          "Company",
          "Uploaded",
          "Pending",
          "Verified",
          "Last upload",
          "KYC",
          "Actions",
        ]}
        emptyTitle="No customer documents"
        emptyDescription="No customers match the current search or KYC filter."
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
              <p className="text-xs text-slate-400">{row.customerId}</p>
            </TableCell>
            <TableCell>{row.companyName}</TableCell>
            <TableCell>{row.documents.length}</TableCell>
            <TableCell>
              <span
                className={
                  docsPending(row) > 0
                    ? "font-medium text-amber-600"
                    : "text-slate-500"
                }
              >
                {docsPending(row)}
              </span>
            </TableCell>
            <TableCell>{docsVerified(row)}</TableCell>
            <TableCell>{lastUpload(row)}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.kycStatus} />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setViewCustomerId(row.id)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CustomerDocsDrawer
        open={Boolean(viewCustomer)}
        customer={viewCustomer}
        onClose={() => setViewCustomerId(null)}
      />
    </OperationsShell>
  );
}
