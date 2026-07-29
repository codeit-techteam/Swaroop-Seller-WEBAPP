"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Download,
  Info,
  Microscope,
  Plus,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  ConfirmationDialog,
  DraftIndicator,
  FileUploader,
  InventoryCard,
  PricingCard,
  StickyFooter,
  SuccessModal,
} from "@/components/marketplace";
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
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import { productFormSchema } from "@/lib/schemas/marketplace";
import { originCountries, productCategories } from "@/mock/products";
import { useProductStore } from "@/store/productStore";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

export function AddProductView() {
  const router = useRouter();
  const draft = useProductStore((s) => s.draft);
  const lastSavedAt = useProductStore((s) => s.lastSavedAt);
  const updateDraft = useProductStore((s) => s.updateDraft);
  const updateUpload = useProductStore((s) => s.updateUpload);
  const saveDraft = useProductStore((s) => s.saveDraft);
  const publishProduct = useProductStore((s) => s.publishProduct);
  const addInventory = useProductStore((s) => s.addInventory);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishOpen, setPublishOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  const simulateUpload = useCallback(
    (uploadId: string, file: File) => {
      const upload = draft.uploads.find((u) => u.id === uploadId);
      if (!upload) return;

      const maxSize = upload.type === "image" ? MAX_IMAGE_SIZE : MAX_PDF_SIZE;
      if (file.size > maxSize) {
        updateUpload(uploadId, {
          status: "error",
          errorMessage: `File exceeds ${upload.type === "image" ? "5MB" : "10MB"} limit`,
        });
        toast.error("File size exceeds limit");
        return;
      }

      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      updateUpload(uploadId, {
        status: "uploading",
        fileName: file.name,
        fileSize: file.size,
        uploadProgress: 0,
        errorMessage: undefined,
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          clearInterval(interval);
          updateUpload(uploadId, {
            status: "uploaded",
            uploadProgress: 100,
            previewUrl,
          });
          toast.success(`${upload.label} uploaded`);
        } else {
          updateUpload(uploadId, {
            uploadProgress: Math.min(Math.round(progress), 99),
          });
        }
      }, 200);
    },
    [draft.uploads, updateUpload],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
      toast.success("Draft Saved", { id: "auto-save" });
    }, 20000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  const validate = () => {
    const result = productFormSchema.safeParse(draft);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Add New Product</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add new product grades and inventory for trading
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export Templates
          </Button>
          <Button
            size="sm"
            className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
            asChild
          >
            <Link href={ROUTES.OFFERS_CREATE}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Offer
            </Link>
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-2">
          <Info className="h-4 w-4 text-[#0B1F3A]" />
          <h2 className="text-sm font-semibold text-slate-800">
            Product Information
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Product Category
            </Label>
            <Select
              value={draft.category}
              onValueChange={(value) => updateDraft({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? (
              <p className="text-xs text-red-500">{errors.category}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Product Grade
            </Label>
            <Input
              placeholder="e.g. LLDPE Film Grade 218W"
              value={draft.productGrade}
              onChange={(e) => updateDraft({ productGrade: e.target.value })}
            />
            {errors.productGrade ? (
              <p className="text-xs text-red-500">{errors.productGrade}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Manufacturer / Brand
            </Label>
            <Input
              placeholder="e.g. SABIC, Reliance, ExxonMobil"
              value={draft.manufacturer}
              onChange={(e) => updateDraft({ manufacturer: e.target.value })}
            />
            {errors.manufacturer ? (
              <p className="text-xs text-red-500">{errors.manufacturer}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Origin Country
            </Label>
            <Select
              value={draft.originCountry}
              onValueChange={(value) => updateDraft({ originCountry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {originCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.originCountry ? (
              <p className="text-xs text-red-500">{errors.originCountry}</p>
            ) : null}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Description
            </Label>
            <Textarea
              placeholder="Detailed product description, usage cases, and quality highlights..."
              rows={3}
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {draft.uploads.map((upload) => (
            <FileUploader
              key={upload.id}
              upload={upload}
              onUpload={(file) => simulateUpload(upload.id, file)}
              onReplace={(file) => simulateUpload(upload.id, file)}
              onRemove={() =>
                updateUpload(upload.id, {
                  status: "empty",
                  fileName: undefined,
                  fileSize: undefined,
                  previewUrl: undefined,
                  uploadProgress: undefined,
                  errorMessage: undefined,
                })
              }
            />
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryCard
          inventory={draft.inventory}
          onChange={(data) =>
            updateDraft({ inventory: { ...draft.inventory, ...data } })
          }
          errors={errors}
        />
        <PricingCard
          pricing={draft.pricing}
          onChange={(data) =>
            updateDraft({ pricing: { ...draft.pricing, ...data } })
          }
          errors={errors}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-2">
          <Microscope className="h-4 w-4 text-[#0B1F3A]" />
          <h2 className="text-sm font-semibold text-slate-800">
            Technical Specifications
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              MFI (G/10MIN)
            </Label>
            <Input
              placeholder="e.g. 2.0"
              value={draft.technicalSpecs.mfi}
              onChange={(e) =>
                updateDraft({
                  technicalSpecs: {
                    ...draft.technicalSpecs,
                    mfi: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Density (G/CM³)
            </Label>
            <Input
              placeholder="e.g. 0.918"
              value={draft.technicalSpecs.density}
              onChange={(e) =>
                updateDraft({
                  technicalSpecs: {
                    ...draft.technicalSpecs,
                    density: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Application
            </Label>
            <Input
              placeholder="e.g. Injection Molding"
              value={draft.technicalSpecs.application}
              onChange={(e) =>
                updateDraft({
                  technicalSpecs: {
                    ...draft.technicalSpecs,
                    application: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Technical Specifications / Material Notes
            </Label>
            <Textarea
              placeholder="Enter detailed physical properties, melting point, tensile strength, environmental impact notes..."
              rows={4}
              value={draft.technicalSpecs.materialNotes}
              onChange={(e) =>
                updateDraft({
                  technicalSpecs: {
                    ...draft.technicalSpecs,
                    materialNotes: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </motion.div>

      <StickyFooter left={<DraftIndicator lastSavedAt={lastSavedAt} />}>
        <Button
          variant="outline"
          onClick={() => {
            saveDraft();
            toast.success("Draft Saved");
          }}
        >
          <ClipboardList className="mr-1.5 h-4 w-4" />
          Save Draft
        </Button>
        <Button
          variant="outline"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          onClick={() => setInventoryOpen(true)}
        >
          Add Inventory
        </Button>
        <Button variant="outline" onClick={() => setCreateOfferOpen(true)}>
          <Tag className="mr-1.5 h-4 w-4" />
          Create Offer
        </Button>
        <Button
          className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
          onClick={() => {
            if (validate()) setPublishOpen(true);
            else toast.error("Please fix validation errors");
          }}
        >
          Publish Product
        </Button>
      </StickyFooter>

      <ConfirmationDialog
        open={inventoryOpen}
        onOpenChange={setInventoryOpen}
        title="Add Inventory"
        description="This will add the current inventory configuration to your warehouse stock. Continue?"
        confirmLabel="Add Inventory"
        onConfirm={() => {
          addInventory();
          setInventoryOpen(false);
          toast.success("Inventory Updated");
        }}
      />

      <ConfirmationDialog
        open={createOfferOpen}
        onOpenChange={setCreateOfferOpen}
        title="Create Offer"
        description="Save product as draft and proceed to create a trading offer?"
        confirmLabel="Create Offer"
        onConfirm={() => {
          saveDraft();
          setCreateOfferOpen(false);
          router.push(ROUTES.OFFERS_CREATE);
        }}
      />

      <SuccessModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Product Published"
        description="Your product has been successfully published to the marketplace and is now available for trading."
        actionLabel="View Inventory"
        onAction={() => {
          publishProduct();
          router.push(ROUTES.INVENTORY);
        }}
      />
    </div>
  );
}
