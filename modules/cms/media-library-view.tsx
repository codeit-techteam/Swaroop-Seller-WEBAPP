"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { CxFormDrawer } from "@/components/cx";
import { OperationsShell, OpsTable } from "@/components/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientTable } from "@/hooks/useClientTable";
import { formatDate } from "@/lib/utils";
import { useCmsStore } from "@/store/cmsStore";
import type { CmsMediaAsset } from "@/types/marketplace-cms";

export function MediaLibraryView({ kind }: { kind?: "IMAGE" | "VIDEO" }) {
  const media = useCmsStore((s) => s.media);
  const addMedia = useCmsStore((s) => s.addMedia);
  const rows = kind ? media.filter((item) => item.kind === kind) : media;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [assetKind, setAssetKind] = useState<"IMAGE" | "VIDEO">(
    kind ?? "IMAGE",
  );
  const searchFields = useMemo(
    () => (row: CmsMediaAsset) => [row.name, row.url, row.usedIn],
    [],
  );
  const table = useClientTable({
    rows,
    searchFields,
    getStatus: (row) => row.kind,
  });

  return (
    <OperationsShell
      title={kind === "VIDEO" ? "Videos" : "Media library"}
      subtitle="Shared assets for banners, catalog and homepage sections."
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add {kind === "VIDEO" ? "video" : "media"}
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search media"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={kind ? ["ALL", kind] : ["ALL", "IMAGE", "VIDEO"]}
        headers={["Name", "Type", "Used in", "Added"]}
        emptyTitle="No media"
        emptyDescription="Upload or register a media URL to use in CMS."
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.filtered.length}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
        rowCount={table.paginated.length}
      >
        {table.paginated.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.kind}</TableCell>
            <TableCell>{row.usedIn}</TableCell>
            <TableCell>{formatDate(row.createdAt)}</TableCell>
          </TableRow>
        ))}
      </OpsTable>
      <CxFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add media"
        submitLabel="Save media"
        onSubmit={async () => {
          if (!name.trim() || !url.trim()) {
            toast.error("Name and URL are required");
            return;
          }
          await addMedia({
            name: name.trim(),
            url: url.trim(),
            kind: assetKind,
            usedIn: "Unassigned",
          });
          toast.success("Media added");
          setOpen(false);
          setName("");
        }}
      >
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>URL</Label>
          <Input value={url} onChange={(event) => setUrl(event.target.value)} />
        </div>
        {!kind ? (
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={assetKind}
              onValueChange={(value) =>
                setAssetKind(value as "IMAGE" | "VIDEO")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">Image</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </CxFormDrawer>
    </OperationsShell>
  );
}
