"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { EmptyState } from "@/components/common";
import { OperationsShell, OpsStatusBadge, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import { formatCompactInr, formatNumber } from "@/lib/utils";
import { findProcurementItem } from "@/modules/procurement/selectors";
import { useWorkbench } from "@/modules/procurement/use-workbench";
import { useProcurementStore } from "@/store/procurementStore";

type SortKey = "price" | "delivery" | "rating";

export function SellerComparisonView() {
  const router = useRouter();
  const params = useSearchParams();
  const { isSeller, allItems } = useWorkbench();
  const selectSeller = useProcurementStore((s) => s.selectSeller);
  const startNegotiation = useProcurementStore((s) => s.startNegotiation);
  const prs = allItems.filter((item) => item.type === "PR" && item.offers.length);
  const selectedId = params.get("pr") ?? prs[0]?.requestId ?? "";
  const item = findProcurementItem(allItems, selectedId);
  const [sort, setSort] = useState<SortKey>("price");
  const [compliance, setCompliance] = useState("ALL");
  const [availability, setAvailability] = useState("ALL");

  const offers = item?.offers ?? [];
  const rows = [...offers]
    .filter((offer) => compliance === "ALL" || offer.compliance === compliance)
    .filter((offer) => {
      if (!item || availability === "ALL") return true;
      if (availability === "FULL") return (offer.availableQty ?? offer.quantity) >= item.quantityMt;
      return (offer.availableQty ?? offer.quantity) < item.quantityMt;
    })
    .sort((a, b) => {
      if (sort === "price") return a.unitPrice - b.unitPrice;
      if (sort === "delivery") return (a.deliveryDays ?? 99) - (b.deliveryDays ?? 99);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

  if (isSeller) {
    return (
      <OperationsShell title="Seller Comparison" subtitle="Admin only">
        <EmptyState
          title="Not available"
          description="Seller comparison is an internal PetroTrade operations view."
        />
      </OperationsShell>
    );
  }

  return (
    <OperationsShell
      title="Seller Comparison"
      subtitle="Compare quotations submitted for a purchase request. Competing prices are never shown to sellers."
      actions={
        <Select
          value={selectedId || "none"}
          onValueChange={(value) =>
            router.replace(`${ROUTES.PROCUREMENT_SELLER_COMPARISON}?pr=${value}`)
          }
        >
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue placeholder="Select PR" />
          </SelectTrigger>
          <SelectContent>
            {prs.map((row) => (
              <SelectItem key={row.requestId} value={row.requestId}>
                {row.requestId} · {row.commodity} {row.grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {!item ? (
        <EmptyState
          title="No quotations yet"
          description="Assign sellers and wait for quotes before comparing."
        />
      ) : (
        <OpsTable
          search=""
          onSearch={() => undefined}
          status="ALL"
          onStatusChange={() => undefined}
          statusOptions={["ALL"]}
          extraFilters={
            <>
              <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Sort: lowest price</SelectItem>
                  <SelectItem value="delivery">Sort: fastest delivery</SelectItem>
                  <SelectItem value="rating">Sort: seller rating</SelectItem>
                </SelectContent>
              </Select>
              <Select value={compliance} onValueChange={setCompliance}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All compliance</SelectItem>
                  <SelectItem value="VALID">Valid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="h-9 w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All availability</SelectItem>
                  <SelectItem value="FULL">Full quantity</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
          headers={[
            "Seller",
            "Quoted Price / MT",
            "Total Value",
            "Available Quantity",
            "Delivery Timeline",
            "Payment Terms",
            "Credit Terms",
            "Validity",
            "Compliance",
            "Rating",
            "Negotiation Status",
            "Action",
          ]}
          emptyTitle="No matching quotations"
          emptyDescription="Adjust filters or wait for more seller quotes."
          page={1}
          totalPages={1}
          totalItems={rows.length}
          pageSize={rows.length || 1}
          onPageChange={() => undefined}
          rowCount={rows.length}
        >
          {rows.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell className="font-medium">{offer.supplierName}</TableCell>
              <TableCell>₹{formatNumber(offer.unitPrice)}</TableCell>
              <TableCell>
                {formatCompactInr(offer.unitPrice * item.quantityMt)}
              </TableCell>
              <TableCell>
                {formatNumber(offer.availableQty ?? offer.quantity)} MT
              </TableCell>
              <TableCell>{offer.delivery}</TableCell>
              <TableCell>{offer.paymentTerms}</TableCell>
              <TableCell>{offer.creditTerms ?? "—"}</TableCell>
              <TableCell>{offer.validity ?? "—"}</TableCell>
              <TableCell>
                <OpsStatusBadge status={offer.compliance ?? "VALID"} />
              </TableCell>
              <TableCell>{offer.rating?.toFixed(1) ?? "—"}</TableCell>
              <TableCell>
                <OpsStatusBadge status={item.negotiationStatus ?? "NONE"} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    className="h-7 bg-[#1B6EF3] px-2 text-xs hover:bg-[#1558C8]"
                    onClick={() => {
                      selectSeller(item.requestId, offer.id);
                      toast.success(`${offer.supplierName} selected.`);
                    }}
                  >
                    Select seller
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      selectSeller(item.requestId, offer.id);
                      startNegotiation(item.requestId);
                      toast.success("Negotiation started.");
                      router.push(
                        `${ROUTES.PROCUREMENT_NEGOTIATION}/${item.requestId}`,
                      );
                    }}
                  >
                    Start negotiation
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </OpsTable>
      )}
    </OperationsShell>
  );
}
