"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { CxFormDrawer, FieldError } from "@/components/cx";
import {
  OperationsShell,
  OpsStatusBadge,
  OpsTable,
} from "@/components/operations";
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
import { useCmsStore } from "@/store/cmsStore";
import type {
  BannerCtaAction,
  BannerVisibility,
  CmsBanner,
} from "@/types/marketplace-cms";
import { BANNER_CTA_LABELS } from "@/types/marketplace-cms";

export function BannersView() {
  const banners = useCmsStore((s) => s.banners);
  const upsertBanner = useCmsStore((s) => s.upsertBanner);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaAction, setCtaAction] = useState<BannerCtaAction>("SHOP_NOW");
  const [status, setStatus] = useState<BannerVisibility>("DRAFT");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1600&q=80",
  );
  const searchFields = useMemo(
    () => (row: CmsBanner) => [row.title, row.subtitle, row.ctaText],
    [],
  );
  const table = useClientTable({
    rows: banners,
    searchFields,
    getStatus: (row) => row.status,
  });

  return (
    <OperationsShell
      title="Banners"
      subtitle="Live banners render on Customer APP and Customer WEB home screens."
      actions={
        <Button
          className="bg-[#0B1F3A] hover:bg-[#122846]"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create banner
        </Button>
      }
    >
      <OpsTable
        search={table.search}
        onSearch={table.setSearch}
        searchPlaceholder="Search banners"
        status={table.status}
        onStatusChange={table.setStatus}
        statusOptions={[
          "ALL",
          "DRAFT",
          "SCHEDULED",
          "LIVE",
          "EXPIRED",
          "INACTIVE",
        ]}
        headers={["Banner", "CTA", "Window", "Order", "Status"]}
        emptyTitle="No banners"
        emptyDescription="Create a banner and set it live to show it on customer home."
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
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-slate-400">{row.subtitle}</p>
            </TableCell>
            <TableCell>
              {row.ctaText} · {BANNER_CTA_LABELS[row.ctaAction]}
            </TableCell>
            <TableCell>
              {row.startDate} → {row.endDate}
            </TableCell>
            <TableCell>{row.displayOrder}</TableCell>
            <TableCell>
              <OpsStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </OpsTable>

      <CxFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Create banner"
        submitLabel="Save banner"
        onSubmit={async () => {
          if (title.trim().length < 3) {
            toast.error("Banner title is required");
            return;
          }
          await upsertBanner({
            title: title.trim(),
            subtitle,
            ctaText,
            ctaAction,
            status,
            imageUrl,
            mobileImageUrl: imageUrl,
            desktopImageUrl: imageUrl,
            startDate: new Date().toISOString().slice(0, 10),
            endDate: "2026-12-31",
          });
          toast.success(
            status === "LIVE"
              ? "Banner is live on Customer APP/WEB"
              : "Banner saved",
          );
          setOpen(false);
          setTitle("");
        }}
      >
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <FieldError message={title.trim() ? undefined : "Required"} />
        </div>
        <div className="space-y-1">
          <Label>Subtitle</Label>
          <Input
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>CTA text</Label>
            <Input
              value={ctaText}
              onChange={(event) => setCtaText(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>CTA action</Label>
            <Select
              value={ctaAction}
              onValueChange={(value) => setCtaAction(value as BannerCtaAction)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(BANNER_CTA_LABELS) as BannerCtaAction[]).map(
                  (action) => (
                    <SelectItem key={action} value={action}>
                      {BANNER_CTA_LABELS[action]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as BannerVisibility)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["DRAFT", "SCHEDULED", "LIVE", "INACTIVE"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Image URL</Label>
          <Input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </div>
      </CxFormDrawer>
    </OperationsShell>
  );
}
