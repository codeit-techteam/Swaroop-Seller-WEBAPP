"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { OperationsShell } from "@/components/operations";
import { ROUTES } from "@/lib/constants";
import { useCustomerStore } from "@/store/customerStore";
import { useCxOpsStore } from "@/store/cxOpsStore";
import { useDocumentStore } from "@/store/documentStore";
import { useFinanceStore } from "@/store/financeStore";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useProcurementStore } from "@/store/procurementStore";
import { useShipmentStore } from "@/store/shipmentStore";
import type { GlobalSearchHit } from "@/types/cx-ops";

export function GlobalSearchView() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const customers = useCustomerStore((s) => s.customers);
  const products = useMarketplaceCmsStore((s) => s.products);
  const categories = useMarketplaceCmsStore((s) => s.categories);
  const offers = useMarketplaceCmsStore((s) => s.offers);
  const tickets = useCxOpsStore((s) => s.tickets);
  const orders = useOrdersStore((s) => s.orders);
  const prs = useProcurementStore((s) => s.items);
  const payments = useFinanceStore((s) => s.payments);
  const documents = useDocumentStore((s) => s.documents ?? []);
  const shipments = useShipmentStore((s) => s.shipments ?? []);

  const hits = useMemo(() => {
    if (query.length < 2) return [] as GlobalSearchHit[];
    const all: GlobalSearchHit[] = [
      ...customers.map((row) => ({
        id: row.id,
        category: "Customers" as const,
        title: row.name,
        subtitle: `${row.customerId} · ${row.companyName}`,
        href: `${ROUTES.CUSTOMERS}/${row.id}`,
      })),
      ...orders.map((row) => ({
        id: row.id,
        category: "Orders" as const,
        title: row.orderNumber,
        subtitle: `${row.buyerCompany} · ${row.productGrade}`,
        href: `${ROUTES.ORDERS}/${row.id}`,
      })),
      ...prs.map((row) => ({
        id: row.id,
        category: "Purchase Requests" as const,
        title: row.requestId,
        subtitle: `${row.buyer} · ${row.commodity} ${row.grade}`,
        href: `${ROUTES.PROCUREMENT}/${row.requestId}`,
      })),
      ...products.map((row) => ({
        id: row.id,
        category: "Products" as const,
        title: row.name,
        subtitle: `${row.grade} · ${row.sku}`,
        href: ROUTES.MARKETPLACE_CATALOG,
      })),
      ...categories.map((row) => ({
        id: row.id,
        category: "Categories" as const,
        title: row.name,
        subtitle: row.slug,
        href: ROUTES.MARKETPLACE_CATEGORIES,
      })),
      ...offers.map((row) => ({
        id: row.id,
        category: "Offers" as const,
        title: row.name,
        subtitle: row.status,
        href: ROUTES.MARKETPLACE_OFFERS,
      })),
      ...payments.map((row) => ({
        id: row.id,
        category: "Invoices" as const,
        title: row.paymentId,
        subtitle: `${row.orderId} · ${row.counterparty}`,
        href: ROUTES.PAYMENTS,
      })),
      ...shipments.map((row) => ({
        id: row.id,
        category: "Shipments" as const,
        title: row.id,
        subtitle: row.status ?? "Shipment",
        href: ROUTES.SHIPMENT_TRACKING,
      })),
      ...documents.map((row) => ({
        id: row.id,
        category: "Documents" as const,
        title: row.name,
        subtitle: row.type,
        href: ROUTES.DOCUMENT_CENTER,
      })),
      ...tickets.map((row) => ({
        id: row.id,
        category: "Tickets" as const,
        title: row.ticketId,
        subtitle: `${row.customerName} · ${row.subject}`,
        href: `${ROUTES.CUSTOMER_SUPPORT}/${row.id}`,
      })),
    ];
    return all.filter(
      (hit) =>
        hit.title.toLowerCase().includes(query) ||
        hit.subtitle.toLowerCase().includes(query),
    );
  }, [
    categories,
    customers,
    documents,
    offers,
    orders,
    payments,
    products,
    prs,
    query,
    shipments,
    tickets,
  ]);

  const grouped = useMemo(() => {
    const map = new Map<GlobalSearchHit["category"], GlobalSearchHit[]>();
    hits.forEach((hit) => {
      const list = map.get(hit.category) ?? [];
      list.push(hit);
      map.set(hit.category, list);
    });
    return map;
  }, [hits]);

  return (
    <OperationsShell
      title="Search"
      subtitle={
        query
          ? `Results for “${query}”`
          : "Search customers, orders, PRs, products, offers, invoices, shipments, documents and tickets."
      }
    >
      {query.length < 2 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Type at least two characters in the top search bar.
        </p>
      ) : hits.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No matching records.
        </p>
      ) : (
        <div className="space-y-5">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <section
              key={category}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {category}
              </h2>
              <div className="mt-2 divide-y divide-slate-100">
                {items.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block py-2 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-[#1B6EF3]">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </OperationsShell>
  );
}
