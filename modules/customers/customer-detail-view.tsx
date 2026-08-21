"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog } from "@/components/cx";
import { SummaryCard } from "@/components/erp";
import { CustomerDocsDrawer } from "@/components/kyc";
import { OperationsShell, OpsStatusBadge } from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatDate } from "@/lib/utils";
import { CustomerFormDrawer } from "@/modules/customers/customer-form-drawer";
import { useCustomerStore } from "@/store/customerStore";
import { useCxOpsStore } from "@/store/cxOpsStore";
import { useFinanceStore } from "@/store/financeStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useProcurementStore } from "@/store/procurementStore";
import {
  CUSTOMER_TYPE_LABELS,
  type CustomerKycStatus,
  type CustomerProfile,
} from "@/types/customers";

const TABS = [
  "overview",
  "orders",
  "requests",
  "payments",
  "credit",
  "documents",
  "addresses",
  "activity",
  "support",
  "notifications",
] as const;

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customer = useCustomerStore((s) => s.getCustomer(customerId));
  const setAccountStatus = useCustomerStore((s) => s.setAccountStatus);
  const setKycStatus = useCustomerStore((s) => s.setKycStatus);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);
  const sendNotification = useCxOpsStore((s) => s.sendNotification);
  const tickets = useCxOpsStore((s) => s.tickets);
  const notifications = useCxOpsStore((s) => s.notifications);
  const orders = useOrdersStore((s) => s.orders);
  const payments = useFinanceStore((s) => s.payments);
  const policies = useFinanceStore((s) => s.policies);
  const prs = useProcurementStore((s) => s.items);
  const [editOpen, setEditOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [kycAction, setKycAction] = useState<CustomerKycStatus | null>(null);
  const [reason, setReason] = useState("");
  const [pendingStatus, setPendingStatus] = useState<
    "SUSPENDED" | "ACTIVE" | null
  >(null);
  const tab = searchParams.get("tab") ?? "overview";

  const relatedOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.buyerCompany
          .toLowerCase()
          .includes(
            (customer?.companyName ?? "").toLowerCase().split(" ")[0] ?? "___",
          ),
      ),
    [customer?.companyName, orders],
  );
  const relatedPrs = useMemo(
    () =>
      prs.filter(
        (item) =>
          item.buyerCompany === customer?.companyName ||
          item.buyer === customer?.name ||
          item.buyerCompany.includes(
            customer?.companyName.split(" ")[0] ?? "___",
          ),
      ),
    [customer, prs],
  );
  const relatedPayments = useMemo(
    () =>
      payments.filter(
        (item) =>
          item.counterparty === customer?.companyName ||
          item.counterparty === customer?.name,
      ),
    [customer, payments],
  );
  const relatedPolicy = policies.find(
    (item) => item.buyer === customer?.companyName,
  );
  const relatedTickets = tickets.filter(
    (item) => item.customerId === customer?.id,
  );
  const relatedNotes = notifications.filter(
    (item) => item.targetValue === customer?.id,
  );

  if (!customer) {
    return (
      <OperationsShell
        title="Customer not found"
        subtitle="This customer record is unavailable."
      >
        <Button variant="outline" onClick={() => router.push(ROUTES.CUSTOMERS)}>
          Back to directory
        </Button>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell
      title={customer.name}
      subtitle={`${customer.companyName} · ${CUSTOMER_TYPE_LABELS[customer.customerType]} · ${customer.gstin}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => setKycAction("VERIFIED")}>
            Verify
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPendingStatus(
                customer.accountStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
              )
            }
          >
            {customer.accountStatus === "SUSPENDED" ? "Activate" : "Suspend"}
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={async () => {
              await sendNotification({
                title: "Account notification",
                message: `${customer.name}, your PetroTrade account has an update.`,
                cta: "Open account",
                targetScreen: "/profile",
                channels: ["PUSH", "IN_APP"],
                target: "SPECIFIC",
                targetValue: customer.id,
                status: "SENT",
                sentAt: new Date().toISOString(),
              });
              toast.success("Notification sent");
            }}
          >
            Send notification
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <OpsStatusBadge status={customer.kycStatus} />
        <OpsStatusBadge status={customer.accountStatus} />
        <OpsStatusBadge status={customer.creditStatus} />
      </div>

      <Tabs
        value={TABS.includes(tab as (typeof TABS)[number]) ? tab : "overview"}
        onValueChange={(value) =>
          router.replace(`${ROUTES.CUSTOMERS}/${customer.id}?tab=${value}`)
        }
      >
        <TabsList className="h-auto flex-wrap justify-start bg-slate-100">
          {TABS.map((item) => (
            <TabsTrigger key={item} value={item} className="capitalize">
              {item.replace("requests", "purchase requests")}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard title="Total orders" value={customer.totalOrders} />
            <SummaryCard
              title="Purchase value"
              value={customer.totalPurchaseValue / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard title="Active orders" value={customer.activeOrders} />
            <SummaryCard
              title="Pending payments"
              value={customer.pendingPayments}
            />
            <SummaryCard
              title="Outstanding"
              value={customer.outstanding / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard
              title="Credit limit"
              value={customer.creditLimit / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard
              title="Available credit"
              value={customer.availableCredit / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard
              title="KYC"
              value={0}
              hint={customer.kycStatus.replaceAll("_", " ")}
            />
            <SummaryCard
              title="Last login"
              value={0}
              hint={
                customer.lastLogin ? formatDate(customer.lastLogin) : "Never"
              }
            />
            <SummaryCard
              title="Last order"
              value={0}
              hint={
                customer.lastOrder ? formatDate(customer.lastOrder) : "None"
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <RelatedTable
            empty="No orders for this customer."
            rows={relatedOrders.map((order) => [
              order.orderNumber,
              order.productGrade,
              `${order.quantityMt} MT`,
              order.status,
              `/orders/${order.id}`,
            ])}
          />
        </TabsContent>
        <TabsContent value="requests">
          <RelatedTable
            empty="No purchase requests."
            rows={relatedPrs.map((item) => [
              item.requestId,
              `${item.commodity} ${item.grade}`,
              `${item.quantityMt} MT`,
              item.status,
              ROUTES.CUSTOMER_REQUESTS,
            ])}
          />
        </TabsContent>
        <TabsContent value="payments">
          <RelatedTable
            empty="No payments."
            rows={relatedPayments.map((item) => [
              item.paymentId,
              item.orderId,
              formatCompactInr(item.amount),
              item.status,
              ROUTES.PAYMENTS,
            ])}
          />
        </TabsContent>
        <TabsContent value="credit" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Limit"
              value={customer.credit.limit / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard
              title="Available"
              value={customer.credit.available / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard
              title="Used"
              value={customer.credit.used / 1_00_000}
              prefix="₹"
              suffix="L"
              decimals={1}
            />
            <SummaryCard
              title="Utilization"
              value={customer.credit.utilizationPct}
              suffix="%"
            />
          </div>
          <p className="text-sm text-slate-500">
            Insurance {relatedPolicy?.status ?? customer.credit.insuranceStatus}
            {relatedPolicy
              ? ` · ${relatedPolicy.policyId} · ${relatedPolicy.insurer}`
              : null}
            . Underwriting detail stays admin-only.
          </p>
        </TabsContent>
        <TabsContent value="documents">
          <RelatedTable
            empty="No documents uploaded."
            rows={customer.documents.map((doc) => [
              doc.name,
              doc.type,
              doc.uploadedAt,
              doc.status,
              "#",
            ])}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setDocsOpen(true)}>
              View documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setKycAction("VERIFIED")}
            >
              Verify KYC
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setKycAction("REJECTED")}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setKycAction("PENDING")}
            >
              Request correction
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="addresses">
          <div className="grid gap-3 md:grid-cols-2">
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {address.kind}
                </p>
                <p className="mt-1 font-medium text-slate-800">
                  {address.label}
                </p>
                <p className="text-sm text-slate-500">
                  {address.line1}, {address.city}, {address.state}{" "}
                  {address.pincode}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Address edits are audited. Silent customer-address changes are not
            allowed from this panel.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <div className="space-y-2">
            {customer.activity.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-slate-100 bg-white px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-800">
                  {event.title}
                </p>
                <p className="text-xs text-slate-500">{event.description}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {formatDate(event.at)}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="support">
          <RelatedTable
            empty="No support tickets."
            rows={relatedTickets.map((ticket) => [
              ticket.ticketId,
              ticket.subject,
              ticket.priority,
              ticket.status,
              `${ROUTES.CUSTOMER_SUPPORT}/${ticket.id}`,
            ])}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <RelatedTable
            empty="No notifications sent to this customer."
            rows={relatedNotes.map((item) => [
              item.title,
              item.cta,
              item.target,
              item.status,
              ROUTES.CUSTOMER_NOTIFICATIONS,
            ])}
          />
        </TabsContent>
      </Tabs>

      <CustomerFormDrawer
        open={editOpen}
        customer={customer}
        onClose={() => setEditOpen(false)}
        onSave={async (draft) => {
          await updateCustomer(customer.id, draft);
          toast.success("Customer updated");
        }}
      />

      <CustomerDocsDrawer
        open={docsOpen}
        customer={customer}
        onClose={() => setDocsOpen(false)}
      />

      <ConfirmActionDialog
        open={Boolean(pendingStatus)}
        title={
          pendingStatus === "SUSPENDED"
            ? "Suspend this customer?"
            : "Activate this customer?"
        }
        description="Customer APP and WEB access will update immediately."
        destructive={pendingStatus === "SUSPENDED"}
        onCancel={() => setPendingStatus(null)}
        onConfirm={async () => {
          if (!pendingStatus) return;
          await setAccountStatus(customer.id, pendingStatus);
          toast.success("Account status updated");
          setPendingStatus(null);
        }}
      />

      <ConfirmActionDialog
        open={Boolean(kycAction)}
        title={kycTitle(kycAction)}
        description="KYC outcomes are visible to the customer. Internal reviewer notes stay here."
        reasonRequired={kycAction === "REJECTED"}
        reason={reason}
        onReasonChange={setReason}
        destructive={kycAction === "REJECTED"}
        onCancel={() => {
          setKycAction(null);
          setReason("");
        }}
        onConfirm={async () => {
          if (!kycAction) return;
          await setKycStatus(customer.id, kycAction, reason);
          toast.success("KYC updated");
          setKycAction(null);
          setReason("");
        }}
      />
    </OperationsShell>
  );
}

function kycTitle(status: CustomerKycStatus | null) {
  if (status === "VERIFIED") return "Approve KYC?";
  if (status === "REJECTED") return "Reject KYC?";
  return "Request KYC correction?";
}

function RelatedTable({ rows, empty }: { rows: string[][]; empty: string }) {
  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const href = row[4];
            const isLink = Boolean(href && href !== "#");
            return (
              <TableRow key={row[0]}>
                <TableCell>
                  {isLink ? (
                    <Link
                      href={href!}
                      className="font-medium text-[#1B6EF3] hover:underline"
                    >
                      {row[0]}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-800">{row[0]}</span>
                  )}
                </TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell>{row[2]}</TableCell>
                <TableCell>
                  <OpsStatusBadge status={row[3] ?? ""} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function matchCustomerName(customer: CustomerProfile, haystack: string) {
  return (
    haystack.toLowerCase().includes(customer.companyName.toLowerCase()) ||
    haystack.toLowerCase().includes(customer.name.toLowerCase())
  );
}
