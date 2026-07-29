"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ClipboardList,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { AnimatedNumber } from "@/components/erp/animated-number";
import { ErpPagination } from "@/components/erp/erp-pagination";
import {
  ConfirmationDialog,
  LoadingOverlay,
  OfferFilterDrawer,
  OfferPreviewModal,
  OfferTable,
} from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useOfferStore } from "@/store/offerStore";
import type { Offer, OfferSortBy, OfferTab } from "@/types/offers";

const tabs: { value: OfferTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
  { value: "draft", label: "Draft" },
];

function SummaryMetricCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function OffersView() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const offers = useOfferStore((s) => s.offers);
  const filters = useOfferStore((s) => s.filters);
  const page = useOfferStore((s) => s.page);
  const pageSize = useOfferStore((s) => s.pageSize);
  const isSyncing = useOfferStore((s) => s.isSyncing);
  const confirmDialog = useOfferStore((s) => s.confirmDialog);

  const setSearch = useOfferStore((s) => s.setSearch);
  const setTab = useOfferStore((s) => s.setTab);
  const setPage = useOfferStore((s) => s.setPage);
  const setSortBy = useOfferStore((s) => s.setSortBy);
  const toggleVisibility = useOfferStore((s) => s.toggleVisibility);
  const pauseOffer = useOfferStore((s) => s.pauseOffer);
  const resumeOffer = useOfferStore((s) => s.resumeOffer);
  const deleteOffer = useOfferStore((s) => s.deleteOffer);
  const duplicateOffer = useOfferStore((s) => s.duplicateOffer);
  const syncData = useOfferStore((s) => s.syncData);
  const exportCsv = useOfferStore((s) => s.exportCsv);
  const openConfirmDialog = useOfferStore((s) => s.openConfirmDialog);
  const closeConfirmDialog = useOfferStore((s) => s.closeConfirmDialog);
  const getFilteredOffers = useOfferStore((s) => s.getFilteredOffers);
  const getPaginatedOffers = useOfferStore((s) => s.getPaginatedOffers);
  const getComputedSummary = useOfferStore((s) => s.getComputedSummary);

  void offers;
  const summary = getComputedSummary();
  const filteredOffers = getFilteredOffers();
  const paginatedOffers = getPaginatedOffers();
  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / pageSize));
  const isEmptyCatalog = offers.length === 0;

  const handleConfirm = () => {
    const { type, offerId } = confirmDialog;
    if (!offerId) return;

    switch (type) {
      case "pause":
        pauseOffer(offerId);
        toast.success("Offer Paused");
        break;
      case "resume":
        resumeOffer(offerId);
        toast.success("Offer Resumed");
        break;
      case "delete":
        deleteOffer(offerId);
        toast.success("Offer Deleted");
        break;
      case "duplicate": {
        const dup = duplicateOffer(offerId);
        if (dup) toast.success("Offer duplicated successfully.");
        break;
      }
    }
    closeConfirmDialog();
  };

  const confirmConfig = {
    pause: {
      title: "Pause Offer",
      description:
        "This offer will be hidden from the marketplace. You can resume it later.",
      confirmLabel: "Yes, Pause",
    },
    resume: {
      title: "Resume Offer",
      description:
        "This offer will become active and visible on the marketplace.",
      confirmLabel: "Resume Offer",
    },
    delete: {
      title: "Delete Offer",
      description:
        "This action cannot be undone. The offer will be permanently removed.",
      confirmLabel: "Delete",
    },
    duplicate: {
      title: "Duplicate Offer",
      description: "Create a copy of this offer as a new draft?",
      confirmLabel: "Duplicate",
    },
    activate: {
      title: "Activate Offer",
      description: "Make this offer live on the marketplace?",
      confirmLabel: "Activate",
    },
  };

  const dialogType = confirmDialog.type;
  const dialogConfig = dialogType ? confirmConfig[dialogType] : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Trading Platform / Offers</p>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            Active Offers Management
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              exportCsv();
              toast.success("CSV Exported");
            }}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={async () => {
              await syncData();
              toast.success("Offers synchronized.");
            }}
          >
            <RefreshCw
              className={cn("mr-1.5 h-4 w-4", isSyncing && "animate-spin")}
            />
            Sync Data
          </Button>
          <Button
            size="sm"
            className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
            asChild
          >
            <Link href={ROUTES.OFFERS_CREATE}>
              <Plus className="mr-1.5 h-4 w-4" />
              CREATE NEW OFFER
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetricCard
          label="Total Live Offers"
          value={summary.totalLive}
          icon={Tag}
          iconClassName="bg-blue-50 text-[#1B6EF3]"
          delay={0}
        />
        <SummaryMetricCard
          label="Pending Review"
          value={summary.pendingReview}
          icon={ClipboardList}
          iconClassName="bg-orange-50 text-orange-500"
          delay={0.05}
        />
        <SummaryMetricCard
          label="Approved"
          value={summary.approved}
          icon={Target}
          iconClassName="bg-emerald-50 text-emerald-600"
          delay={0.1}
        />
        <SummaryMetricCard
          label="Need Changes"
          value={summary.needChanges}
          icon={AlertCircle}
          iconClassName="bg-red-50 text-red-500"
          delay={0.15}
        />
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search Offer ID, Grade, Category, or Warehouse..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={filters.tab}
            onValueChange={(value) => setTab(value as OfferTab)}
          >
            <TabsList className="h-9 bg-slate-100">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs data-[state=active]:bg-white"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setSortBy(value as OfferSortBy)}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price_desc">Highest Price</SelectItem>
                <SelectItem value="price_asc">Lowest Price</SelectItem>
                <SelectItem value="moq">MOQ</SelectItem>
                <SelectItem value="grade">Product Grade</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="mr-1.5 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </div>

        <OfferTable
          offers={paginatedOffers}
          emptyMessage={
            isEmptyCatalog
              ? "No offers available."
              : "No offers match your filters."
          }
          showCreateCta={isEmptyCatalog || filteredOffers.length === 0}
          onToggleVisibility={toggleVisibility}
          onPause={(id) => openConfirmDialog("pause", id)}
          onResume={(id) => openConfirmDialog("resume", id)}
          onDuplicate={(id) => openConfirmDialog("duplicate", id)}
          onDelete={(id) => openConfirmDialog("delete", id)}
          onView={(offer) => {
            setPreviewOffer(offer);
            setPreviewOpen(true);
          }}
        />

        {filteredOffers.length > 0 ? (
          <ErpPagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredOffers.length}
            pageSize={pageSize}
            onPageChange={setPage}
            showingLabel={`Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filteredOffers.length)} of ${filteredOffers.length} active offers`}
          />
        ) : null}
      </div>

      <OfferFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      <OfferPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        offer={previewOffer}
      />

      {dialogConfig && dialogType ? (
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => !open && closeConfirmDialog()}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmLabel={dialogConfig.confirmLabel}
          variant={dialogType === "delete" ? "destructive" : "default"}
          onConfirm={handleConfirm}
        />
      ) : null}

      <LoadingOverlay open={isSyncing} message="Syncing offers..." />
    </div>
  );
}
