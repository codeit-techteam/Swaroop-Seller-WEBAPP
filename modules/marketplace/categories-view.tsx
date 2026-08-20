"use client";

import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ConfirmActionDialog, CxFormDrawer, FieldError } from "@/components/cx";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { useMarketplaceCmsStore } from "@/store/marketplaceCmsStore";
import type { CatalogCategory } from "@/types/marketplace-cms";

export function CategoriesView() {
  const categories = useMarketplaceCmsStore((s) => s.categories);
  const upsertCategory = useMarketplaceCmsStore((s) => s.upsertCategory);
  const setCategoryActive = useMarketplaceCmsStore((s) => s.setCategoryActive);
  const reorderCategories = useMarketplaceCmsStore((s) => s.reorderCategories);
  const [open, setOpen] = useState<CatalogCategory | "new" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState<CatalogCategory | null>(null);
  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.displayOrder - b.displayOrder),
    [categories],
  );
  const searchFields = useMemo(
    () => (row: CatalogCategory) => [row.name, row.slug],
    [],
  );
  const table = useClientTable({
    rows: sorted,
    searchFields,
    getStatus: (row) => (row.active ? "ACTIVE" : "INACTIVE"),
  });

  const move = async (id: string, direction: -1 | 1) => {
    const ids = sorted.map((row) => row.id);
    const index = ids.indexOf(id);
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    const copy = [...ids];
    const current = copy[index];
    const swap = copy[next];
    if (!current || !swap) return;
    copy[index] = swap;
    copy[next] = current;
    await reorderCategories(copy);
  };

  return (
    <OperationsShell
      title="Categories"
      subtitle="Category order and visibility drive Customer APP and WEB marketplace navigation."
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => {
            setName("");
            setDescription("");
            setImageUrl(
              "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
            );
            setOpen("new");
          }}
        >
          <Plus className="h-4 w-4" />
          Create category
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search categories"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={["ALL", "ACTIVE", "INACTIVE"]}
        headers={["Order", "Category", "Products", "Status", "Actions"]}
        emptyTitle="No categories"
        emptyDescription="Create a category to start the customer catalog."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="tabular-nums">{row.displayOrder}</TableCell>
            <TableCell>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-slate-400">{row.description}</p>
            </TableCell>
            <TableCell>{row.productIds.length}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={() => void move(row.id, -1)}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={() => void move(row.id, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setName(row.name);
                    setDescription(row.description);
                    setImageUrl(row.imageUrl);
                    setOpen(row);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setPending(row)}
                >
                  {row.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CxFormDrawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open && open !== "new" ? "Edit category" : "Create category"}
        submitLabel="Save category"
        onSubmit={async () => {
          if (name.trim().length < 2) {
            toast.error("Category name is required");
            return;
          }
          await upsertCategory({
            id: open && open !== "new" ? open.id : undefined,
            name: name.trim(),
            description,
            imageUrl,
            active: true,
          });
          toast.success("Category saved");
          setOpen(null);
        }}
      >
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FieldError message={name.trim() ? undefined : "Required"} />
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Image URL</Label>
          <Input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </div>
      </CxFormDrawer>

      <ConfirmActionDialog
        open={Boolean(pending)}
        title={pending?.active ? "Deactivate category?" : "Activate category?"}
        description="Inactive categories are hidden from Customer APP and WEB."
        destructive={Boolean(pending?.active)}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          if (!pending) return;
          await setCategoryActive(pending.id, !pending.active);
          toast.success(
            pending.active ? "Category deactivated" : "Category activated",
          );
          setPending(null);
        }}
      />
    </OperationsShell>
  );
}
