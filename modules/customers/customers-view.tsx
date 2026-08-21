"use client";

import {
  Ban,
  Bell,
  Eye,
  FileCheck2,
  MoreHorizontal,
  Pencil,
  ShoppingBag,
} from "lucide-react";
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
  DropdownMenuSeparator,
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
import { cn, formatCompactInr } from "@/lib/utils";
import { CustomerFormDrawer } from "@/modules/customers/customer-form-drawer";
import { useCustomerStore } from "@/store/customerStore";
import { useCxOpsStore } from "@/store/cxOpsStore";
import { type CustomerDraft, type CustomerProfile } from "@/types/customers";

export function CustomersView() {
  const params = useSearchParams();
  const statusParam = params.get("status")?.toUpperCase() ?? "ALL";
  const customers = useCustomerStore((s) => s.customers);
  const createCustomer = useCustomerStore((s) => s.createCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);
  const setAccountStatus = useCustomerStore((s) => s.setAccountStatus);
  const sendNotification = useCxOpsStore((s) => s.sendNotification);
  const [creditFilter, setCreditFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<CustomerProfile | null>(null);
  const [pending, setPending] = useState<{
    id: string;
    action: "SUSPEND" | "ACTIVATE";
  } | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter((row) => {
        if (creditFilter !== "ALL" && row.creditStatus !== creditFilter)
          return false;
        return true;
      }),
    [creditFilter, customers],
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
    if (drawer) {
      await updateCustomer(drawer.id, draft);
      toast.success("Customer updated");
      return;
    }
    const created = await createCustomer(draft);
    toast.success(`${created.name} added`);
  };

  return (
    <OperationsShell
      title="Customer Directory"
      subtitle="Browse and manage customer accounts across APP and WEB."
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
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search customer, company, mobile, GSTIN..."
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"]}
        extraFilters={
          <Select value={creditFilter} onValueChange={setCreditFilter}>
            <SelectTrigger className="h-10 w-[150px] border-slate-200 bg-white text-sm">
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
                  {value === "ALL" ? "All credit" : value.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        headers={[
          "Customer",
          "Contact",
          "Status",
          "Credit",
          "Business",
          "Actions",
        ]}
        emptyTitle="No customers found"
        emptyDescription="Try another search or status filter."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow
            key={row.id}
            className="border-l-4 border-l-transparent transition-colors hover:border-l-[#1B6EF3]/40 hover:bg-slate-50/80"
          >
            <TableCell className="align-top">
              <Link
                href={`${ROUTES.CUSTOMERS}/${row.id}`}
                className="group block max-w-[220px]"
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
              </Link>
            </TableCell>

            <TableCell className="align-top">
              <p className="text-sm tabular-nums text-slate-800">
                {row.mobile}
              </p>
              <p
                className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500"
                title={row.email}
              >
                {row.email}
              </p>
            </TableCell>

            <TableCell className="align-top">
              <OpsStatusBadge status={row.accountStatus} />
              <p className="mt-1.5 text-[11px] text-slate-500">
                KYC ·{" "}
                <span className="font-medium capitalize text-slate-700">
                  {row.kycStatus.replaceAll("_", " ").toLowerCase()}
                </span>
              </p>
            </TableCell>

            <TableCell className="align-top">
              <p className="text-sm font-semibold tabular-nums text-slate-900">
                {formatCompactInr(row.availableCredit)}
              </p>
              <div className="mt-1.5">
                <OpsStatusBadge status={row.creditStatus} />
              </div>
            </TableCell>

            <TableCell className="align-top">
              <p className="text-sm font-semibold tabular-nums text-slate-900">
                {row.totalOrders}{" "}
                <span className="font-normal text-slate-500">orders</span>
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-slate-500">
                {formatCompactInr(row.totalPurchaseValue)} lifetime
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Active {row.lastActive}
              </p>
            </TableCell>

            <TableCell className="align-top">
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  asChild
                >
                  <Link href={`${ROUTES.CUSTOMERS}/${row.id}`}>View</Link>
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
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`${ROUTES.CUSTOMERS}/${row.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDrawer(row)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit customer
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`${ROUTES.KYC}?customer=${row.id}`}>
                        <FileCheck2 className="mr-2 h-4 w-4" />
                        Verify KYC
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`${ROUTES.CUSTOMER_ORDERS}?customer=${row.id}`}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        View orders
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
                      <Bell className="mr-2 h-4 w-4" />
                      Notify customer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className={cn(
                        row.accountStatus === "SUSPENDED"
                          ? "text-emerald-700"
                          : "text-red-600",
                      )}
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
                      <Ban className="mr-2 h-4 w-4" />
                      {row.accountStatus === "SUSPENDED"
                        ? "Activate account"
                        : "Suspend account"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CustomerFormDrawer
        open={drawer !== null}
        customer={drawer ?? undefined}
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
