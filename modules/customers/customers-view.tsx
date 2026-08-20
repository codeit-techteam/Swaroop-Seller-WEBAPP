"use client";

import { MoreHorizontal, Plus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr } from "@/lib/utils";
import { CustomerFormDrawer } from "@/modules/customers/customer-form-drawer";
import { useCustomerStore } from "@/store/customerStore";
import { useCxOpsStore } from "@/store/cxOpsStore";
import {
  CUSTOMER_TYPE_LABELS,
  type CustomerDraft,
  type CustomerProfile,
  type CustomerType,
} from "@/types/customers";

export function CustomersView() {
  const params = useSearchParams();
  const statusParam = params.get("status")?.toUpperCase() ?? "ALL";
  const customers = useCustomerStore((s) => s.customers);
  const createCustomer = useCustomerStore((s) => s.createCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);
  const setAccountStatus = useCustomerStore((s) => s.setAccountStatus);
  const sendNotification = useCxOpsStore((s) => s.sendNotification);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [creditFilter, setCreditFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<CustomerProfile | "new" | null>(null);
  const [pending, setPending] = useState<{
    id: string;
    action: "SUSPEND" | "ACTIVATE";
  } | null>(null);

  const cities = useMemo(
    () => Array.from(new Set(customers.map((row) => row.city))).sort(),
    [customers],
  );

  const filtered = useMemo(
    () =>
      customers.filter((row) => {
        if (typeFilter !== "ALL" && row.customerType !== typeFilter)
          return false;
        if (creditFilter !== "ALL" && row.creditStatus !== creditFilter)
          return false;
        if (cityFilter !== "ALL" && row.city !== cityFilter) return false;
        return true;
      }),
    [cityFilter, creditFilter, customers, typeFilter],
  );

  const searchFields = useMemo(
    () => (row: CustomerProfile) => [
      row.customerId,
      row.name,
      row.companyName,
      row.email,
      row.mobile,
      row.gstin,
      row.city,
    ],
    [],
  );
  const table = useClientTable({
    rows: filtered,
    searchFields,
    getStatus: (row) => row.accountStatus,
    initialStatus: [
      "ALL",
      "ACTIVE",
      "PENDING",
      "SUSPENDED",
      "INACTIVE",
    ].includes(statusParam)
      ? statusParam
      : "ALL",
    pageSize: 8,
  });

  const save = async (draft: CustomerDraft) => {
    if (drawer && drawer !== "new") {
      await updateCustomer(drawer.id, draft);
      toast.success("Customer updated");
      return;
    }
    const created = await createCustomer(draft);
    toast.success(`${created.companyName} added`);
  };

  return (
    <OperationsShell
      title="Customer Management"
      subtitle="Full customer lifecycle for Customer APP and Customer WEB. Internal seller data is never exposed."
      kpis={[
        { title: "Total customers", value: customers.length },
        {
          title: "Active",
          value: customers.filter((row) => row.accountStatus === "ACTIVE")
            .length,
        },
        {
          title: "Pending KYC",
          value: customers.filter(
            (row) =>
              row.kycStatus === "PENDING" || row.kycStatus === "UNDER_REVIEW",
          ).length,
        },
        {
          title: "Suspended",
          value: customers.filter((row) => row.accountStatus === "SUSPENDED")
            .length,
        },
      ]}
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => setDrawer("new")}
        >
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search ID, name, company, GSTIN, city"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"]}
        extraFilters={
          <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[190px] border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Customer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {(Object.keys(CUSTOMER_TYPE_LABELS) as CustomerType[]).map(
                  (type) => (
                    <SelectItem key={type} value={type}>
                      {CUSTOMER_TYPE_LABELS[type]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Select value={creditFilter} onValueChange={setCreditFilter}>
              <SelectTrigger className="h-9 w-[170px] border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Credit" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "ALL",
                  "APPROVED",
                  "PENDING",
                  "UNDER_REVIEW",
                  "REJECTED",
                  "SUSPENDED",
                  "EXPIRED",
                ].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === "ALL"
                      ? "All credit"
                      : value.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-9 w-[150px] border-slate-200 bg-white text-sm">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        headers={[
          "Customer ID",
          "Customer / Company",
          "Type",
          "Mobile / Email",
          "GSTIN",
          "City",
          "KYC",
          "Credit",
          "Available credit",
          "Orders",
          "Purchase value",
          "Account",
          "Last active",
          "Actions",
        ]}
        emptyTitle="No customers found"
        emptyDescription="Try another filter or add a customer."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium text-[#1B6EF3]">
              <Link href={`${ROUTES.CUSTOMERS}/${row.id}`}>
                {row.customerId}
              </Link>
            </TableCell>
            <TableCell>
              <p className="font-medium text-slate-800">{row.name}</p>
              <p className="text-xs text-slate-400">{row.companyName}</p>
            </TableCell>
            <TableCell className="text-xs">
              {CUSTOMER_TYPE_LABELS[row.customerType]}
            </TableCell>
            <TableCell>
              <p>{row.mobile}</p>
              <p className="text-xs text-slate-400">{row.email}</p>
            </TableCell>
            <TableCell className="font-mono text-xs">{row.gstin}</TableCell>
            <TableCell>{row.city}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.kycStatus} />
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.creditStatus} />
            </TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.availableCredit)}
            </TableCell>
            <TableCell className="tabular-nums">{row.totalOrders}</TableCell>
            <TableCell className="tabular-nums">
              {formatCompactInr(row.totalPurchaseValue)}
            </TableCell>
            <TableCell>
              <OpsStatusBadge status={row.accountStatus} />
            </TableCell>
            <TableCell>{row.lastActive}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`${ROUTES.CUSTOMERS}/${row.id}`}>
                      View customer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDrawer(row)}>
                    Edit customer
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${ROUTES.KYC}?customer=${row.id}`}>
                      Verify KYC
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setPending({
                        id: row.id,
                        action:
                          row.accountStatus === "SUSPENDED"
                            ? "ACTIVATE"
                            : "SUSPEND",
                      })
                    }
                  >
                    {row.accountStatus === "SUSPENDED" ? "Activate" : "Suspend"}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${ROUTES.CUSTOMER_ORDERS}?customer=${row.id}`}>
                      View orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${ROUTES.CUSTOMER_REQUESTS}?customer=${row.id}`}
                    >
                      View purchase requests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${ROUTES.PAYMENTS}?q=${encodeURIComponent(row.companyName)}`}
                    >
                      View payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${ROUTES.CREDIT_INSURANCE}?q=${encodeURIComponent(row.companyName)}`}
                    >
                      View credit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${ROUTES.CUSTOMERS}/${row.id}?tab=documents`}>
                      View documents
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${ROUTES.CUSTOMERS}/${row.id}?tab=activity`}>
                      View activity
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await sendNotification({
                        title: "Account update",
                        message: `Hello ${row.name}, please review your PetroTrade account.`,
                        cta: "Open profile",
                        targetScreen: "/profile",
                        channels: ["IN_APP", "PUSH"],
                        target: "SPECIFIC",
                        targetValue: row.id,
                        status: "SENT",
                        sentAt: new Date().toISOString(),
                      });
                      toast.success("Notification sent");
                    }}
                  >
                    Send notification
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CustomerFormDrawer
        open={drawer !== null}
        customer={drawer && drawer !== "new" ? drawer : undefined}
        onClose={() => setDrawer(null)}
        onSave={save}
      />

      <ConfirmActionDialog
        open={Boolean(pending)}
        title={
          pending?.action === "SUSPEND"
            ? "Suspend customer?"
            : "Activate customer?"
        }
        description="This changes Customer APP and WEB access immediately."
        confirmLabel={pending?.action === "SUSPEND" ? "Suspend" : "Activate"}
        destructive={pending?.action === "SUSPEND"}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          await setAccountStatus(
            pending.id,
            pending.action === "SUSPEND" ? "SUSPENDED" : "ACTIVE",
          );
          toast.success(
            pending.action === "SUSPEND"
              ? "Customer suspended"
              : "Customer activated",
          );
          setPending(null);
        }}
      />
    </OperationsShell>
  );
}
