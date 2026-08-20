"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileText,
  Package,
  Rocket,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  BuyerPreviewCard,
  ConfirmationDialog,
  LivePriceCalculator,
  LoadingOverlay,
  OfferPreviewModal,
  StickyFooter,
  SuccessModal,
  TierBuilder,
} from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import { offerFormSchema } from "@/lib/schemas/marketplace";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { productCatalog, warehouses } from "@/mock/products";
import { useOfferStore } from "@/store/offerStore";
import type { Offer, PaymentTerm } from "@/types/offers";
import { computeLivePricing, tiersOverlap } from "@/types/offers";

const paymentOptions: { value: PaymentTerm; label: string }[] = [
  { value: "advance", label: "Advance" },
  { value: "on_loading", label: "On Loading" },
  { value: "on_delivery", label: "On Delivery" },
  { value: "credit_15", label: "15 Days Credit" },
  { value: "credit_30", label: "30 Days Credit" },
];

interface CreateOfferViewProps {
  editId?: string;
}

export function CreateOfferView({ editId }: CreateOfferViewProps) {
  const router = useRouter();
  const formData = useOfferStore((s) => s.formData);
  const setFormData = useOfferStore((s) => s.setFormData);
  const resetFormData = useOfferStore((s) => s.resetFormData);
  const loadOfferForEdit = useOfferStore((s) => s.loadOfferForEdit);
  const recalculateTiers = useOfferStore((s) => s.recalculateTiers);
  const addTier = useOfferStore((s) => s.addTier);
  const removeTier = useOfferStore((s) => s.removeTier);
  const duplicateTier = useOfferStore((s) => s.duplicateTier);
  const updateTier = useOfferStore((s) => s.updateTier);
  const reorderTiers = useOfferStore((s) => s.reorderTiers);
  const saveDraft = useOfferStore((s) => s.saveDraft);
  const activateOffer = useOfferStore((s) => s.activateOffer);
  const isActivating = useOfferStore((s) => s.isActivating);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);

  const liveStats = useMemo(() => computeLivePricing(formData), [formData]);

  const overlapError = useMemo(
    () =>
      tiersOverlap(formData.tiers)
        ? "Tier quantity ranges overlap. Adjust min/max quantities."
        : undefined,
    [formData.tiers],
  );

  useEffect(() => {
    if (editId) {
      loadOfferForEdit(editId);
    } else {
      resetFormData();
    }
  }, [editId, loadOfferForEdit, resetFormData]);

  useEffect(() => {
    if (formData.basePrice > 0) {
      recalculateTiers(formData.basePrice);
    }
  }, [formData.basePrice, recalculateTiers]);

  const handleProductChange = useCallback(
    (productId: string) => {
      const product = productCatalog.find((p) => p.id === productId);
      if (!product) return;
      const warehouse = warehouses.find((w) => w.id === product.warehouseId);
      setFormData({
        productId: product.id,
        productName: product.name,
        productGrade: product.grade,
        productSubtext: product.subtext,
        category: product.category,
        warehouseId: product.warehouseId,
        warehouseName: warehouse
          ? `${warehouse.name} (${warehouse.location})`
          : "",
        availableInventoryMt: product.availableMt,
        basePrice: product.basePrice,
        allocationMt: Math.min(100, product.availableMt),
      });
      recalculateTiers(product.basePrice);
    },
    [setFormData, recalculateTiers],
  );

  const handleWarehouseChange = useCallback(
    (warehouseId: string) => {
      const warehouse = warehouses.find((w) => w.id === warehouseId);
      setFormData({
        warehouseId,
        warehouseName: warehouse
          ? `${warehouse.name} (${warehouse.location})`
          : "",
      });
    },
    [setFormData],
  );

  const togglePaymentTerm = (term: PaymentTerm) => {
    const current = formData.paymentTerms;
    const updated = current.includes(term)
      ? current.filter((t) => t !== term)
      : [...current, term];
    setFormData({ paymentTerms: updated });
  };

  const validate = () => {
    const fieldErrors: Record<string, string> = {};

    if (formData.allocationMt > formData.availableInventoryMt) {
      fieldErrors.allocationMt = "Allocation cannot exceed available inventory";
    }
    if (formData.moq <= 0) {
      fieldErrors.moq = "MOQ must be greater than 0";
    }
    if (formData.basePrice <= 0) {
      fieldErrors.basePrice = "Base price must be greater than 0";
    }
    if (!formData.validUntil) {
      fieldErrors.validUntil = "Expiry date is required";
    }
    if (tiersOverlap(formData.tiers)) {
      fieldErrors.tiers = "Tier quantity ranges cannot overlap";
    }
    for (const tier of formData.tiers) {
      if (tier.discountPercent > 100) {
        fieldErrors.tiers = "Discount cannot exceed 100%";
        break;
      }
    }

    const result = offerFormSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const buildPreviewOffer = (): Offer => {
    const draft = saveDraft();
    setPreviewOffer(draft);
    return draft;
  };

  const handleGeneratePdf = () => {
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }
    setPdfOpen(true);
  };

  const downloadDummyPdf = () => {
    const content = [
      "%PDF-1.4",
      "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
      "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
      "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj",
      `4 0 obj<< /Length 68 >>stream\nBT /F1 12 Tf 50 750 Td (${formData.productName || "Trading Offer"} - ${formatCurrency(formData.basePrice)}/MT) Tj ET\nendstream endobj`,
      "xref\n0 5\n0000000000 65535 f \ntrailer<< /Size 5 /Root 1 0 R >>\nstartxref\n0\n%%EOF",
    ].join("\n");
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `offer-${formData.productGrade || "draft"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("PDF downloaded");
    setPdfOpen(false);
  };

  return (
    <div className="relative mx-auto max-w-[1400px] space-y-8 px-4 py-6 md:px-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-500">
          Marketplace Listing
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] md:text-3xl">
          {editId ? "Edit Trading Offer" : "Create Trading Offer"}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Convert available inventory into active marketplace listings with
          tiered pricing and bulk discounts.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="space-y-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A]/5">
                <Package className="h-4 w-4 text-[#0B1F3A]" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                1. Product Selection
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Select Product Grade
                </Label>
                <Select
                  value={formData.productId}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCatalog.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId ? (
                  <p className="text-xs text-red-500">{errors.productId}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Warehouse Location
                </Label>
                <Select
                  value={formData.warehouseId}
                  onValueChange={handleWarehouseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name} ({wh.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouseId ? (
                  <p className="text-xs text-red-500">{errors.warehouseId}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Available Inventory
                </Label>
                <div className="flex h-10 items-center gap-2.5 rounded-md border border-emerald-200 bg-emerald-50/60 px-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    {formatNumber(formData.availableInventoryMt, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    MT
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Allocation for Offer (MT)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={formData.availableInventoryMt}
                    value={formData.allocationMt || ""}
                    onChange={(e) =>
                      setFormData({
                        allocationMt: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    MT
                  </span>
                </div>
                {errors.allocationMt ? (
                  <p className="text-xs text-red-500">{errors.allocationMt}</p>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A]/5">
                <FileText className="h-4 w-4 text-[#0B1F3A]" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                2. Offer Details
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Base Price (₹/MT)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min={1}
                    className="pl-7"
                    placeholder="e.g. 94,500"
                    value={formData.basePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        basePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                {errors.basePrice ? (
                  <p className="text-xs text-red-500">{errors.basePrice}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  MOQ (Min Order Qty)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={formData.moq || ""}
                    onChange={(e) =>
                      setFormData({ moq: parseFloat(e.target.value) || 0 })
                    }
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    MT
                  </span>
                </div>
                {errors.moq ? (
                  <p className="text-xs text-red-500">{errors.moq}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Offer Validity
                </Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ validUntil: e.target.value })}
                />
                {errors.validUntil ? (
                  <p className="text-xs text-red-500">{errors.validUntil}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 space-y-3 border-t border-slate-100 pt-8">
              <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Payment Terms
              </Label>
              <div className="flex flex-wrap gap-2.5">
                {paymentOptions.map((option) => {
                  const selected = formData.paymentTerms.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => togglePaymentTerm(option.value)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        selected
                          ? "border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {errors.paymentTerms ? (
                <p className="text-xs text-red-500">{errors.paymentTerms}</p>
              ) : null}
            </div>

            <div className="mt-8 space-y-2 border-t border-slate-100 pt-8">
              <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Offer Remarks
              </Label>
              <Textarea
                placeholder="Enter special delivery instructions, packaging details, or tax info..."
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ remarks: e.target.value })}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <TierBuilder
              tiers={formData.tiers}
              basePrice={formData.basePrice}
              selectedTierId={selectedTierId}
              onSelectTier={setSelectedTierId}
              onUpdateTier={updateTier}
              onAddTier={() => {
                addTier();
                toast.success("Tier Added");
              }}
              onRemoveTier={(id) => {
                removeTier(id);
                toast.success("Tier Deleted");
              }}
              onDuplicateTier={(id) => {
                duplicateTier(id);
                toast.success("Tier Duplicated");
              }}
              onReorderTiers={reorderTiers}
              overlapError={overlapError ?? errors.tiers}
            />
          </motion.div>

          <LivePriceCalculator
            stats={liveStats}
            allocationMt={formData.allocationMt}
            basePrice={formData.basePrice}
          />
          </div>

          <StickyFooter
            contained
            left={
              <span className="text-xs text-slate-400">
                Changes update buyer preview instantly
              </span>
            }
          >
            <Button
              variant="outline"
              className="h-10 shrink-0"
              onClick={() => {
                saveDraft();
                toast.success("Draft saved.");
              }}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              className="h-10 shrink-0"
              onClick={handleGeneratePdf}
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Generate PDF
            </Button>
            <Button
              variant="outline"
              className="h-10 shrink-0"
              onClick={() => {
                if (!validate()) {
                  toast.error("Please fix validation errors");
                  return;
                }
                const offer = buildPreviewOffer();
                setPreviewOffer(offer);
                setPreviewOpen(true);
              }}
            >
              Preview Offer
            </Button>
            <Button
              className="h-10 shrink-0 bg-[#0B1F3A] px-5 hover:bg-[#0B1F3A]/90"
              onClick={() => {
                if (!validate()) {
                  toast.error("Please fix validation errors");
                  return;
                }
                setActivateOpen(true);
              }}
            >
              <Rocket className="mr-1.5 h-4 w-4" />
              Activate Offer
            </Button>
          </StickyFooter>
        </div>

        <div className="hidden lg:block">
          <BuyerPreviewCard formData={formData} />
        </div>
      </div>

      <OfferPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        offer={previewOffer}
        fullscreen
      />

      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Offer PDF</DialogTitle>
            <DialogDescription>
              Preview summary before downloading a mock PDF for{" "}
              {formData.productName || "this offer"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <p>
              <span className="text-slate-500">Product:</span>{" "}
              {formData.productName || "—"}
            </p>
            <p>
              <span className="text-slate-500">Price:</span>{" "}
              {formatCurrency(formData.basePrice)}/MT
            </p>
            <p>
              <span className="text-slate-500">Allocation:</span>{" "}
              {formData.allocationMt} MT
            </p>
            <p>
              <span className="text-slate-500">MOQ:</span> {formData.moq} MT
            </p>
            <p>
              <span className="text-slate-500">Valid until:</span>{" "}
              {formData.validUntil || "—"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
              onClick={downloadDummyPdf}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Activate Offer"
        description={`Activate ${formData.productName || "this offer"} at ${formatCurrency(formData.basePrice)}/MT with ${formData.allocationMt} MT allocation and MOQ ${formData.moq} MT?`}
        confirmLabel="Submit"
        onConfirm={async () => {
          setActivateOpen(false);
          await activateOffer();
          setSuccessOpen(true);
        }}
      />

      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Offer Activated Successfully"
        description="Your trading offer is now live on the marketplace. Buyers can view and place orders."
        actionLabel="View Offers"
        onAction={() => {
          toast.success("Offer Activated Successfully");
          router.push(ROUTES.OFFERS);
        }}
      />

      <LoadingOverlay open={isActivating} message="Activating offer..." />
    </div>
  );
}
