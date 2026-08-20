"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Info } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CxFormDrawer, FieldError } from "@/components/cx";
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
import { cn } from "@/lib/utils";
import { warehouses } from "@/mock/products";
import type {
  CatalogCategory,
  CatalogProduct,
  PublishStatus,
} from "@/types/marketplace-cms";

const UNIT_OPTIONS = ["MT", "KG", "Bags", "Drums"] as const;
const PACKAGING_OPTIONS = [
  "Jumbo Bags",
  "25kg Bags",
  "Drums",
  "Loose",
] as const;

const PUBLISH_HINTS: Record<PublishStatus, string> = {
  DRAFT: "Stays internal. Customers will not see this SKU.",
  PREVIEW: "Internal preview only. Not listed on Customer APP/WEB.",
  PENDING_APPROVAL: "Waiting for approval before it can go live.",
  LIVE: "Visible immediately on Customer APP and Customer WEB.",
  PAUSED: "Hidden from customers until you publish it again.",
  ARCHIVED: "Removed from the customer catalog.",
};

const schema = z.object({
  name: z.string().min(2, "Product name is required"),
  grade: z.string().min(1, "Grade is required"),
  material: z.string().min(1, "Material is required"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(8, "Description is required"),
  packaging: z.string().min(1, "Packaging is required"),
  unit: z.string().min(1, "Unit is required"),
  moq: z.coerce.number().positive("MOQ must be greater than 0"),
  availableQty: z.preprocess(
    (value) => (value === "" || value === undefined ? 0 : value),
    z.coerce.number().min(0),
  ),
  location: z.string().min(1, "Location is required"),
  sellingPrice: z.coerce.number().positive("Selling price is required"),
  marketPrice: z.preprocess(
    (value) => (value === "" || value === undefined ? 0 : value),
    z.coerce.number().min(0),
  ),
  internalCost: z.preprocess(
    (value) => (value === "" || value === undefined ? 0 : value),
    z.coerce.number().min(0),
  ),
  deliveryCharge: z.preprocess(
    (value) => (value === "" || value === undefined ? 0 : value),
    z.coerce.number().min(0),
  ),
  imageUrl: z.string().url("Enter a valid image URL"),
  publishStatus: z.enum([
    "DRAFT",
    "PREVIEW",
    "PENDING_APPROVAL",
    "LIVE",
    "PAUSED",
    "ARCHIVED",
  ]),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormDrawerProps {
  open: boolean;
  product?: CatalogProduct;
  categories: CatalogCategory[];
  onClose: () => void;
  onSave: (
    product: Partial<CatalogProduct> & { name: string; grade: string },
  ) => Promise<void>;
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
      >
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-[11px] leading-relaxed text-slate-400">{hint}</p>
      ) : null}
      <FieldError message={error} />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CurrencyInput({
  id,
  registration,
  placeholder,
}: {
  id: string;
  registration: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        ₹
      </span>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        placeholder={placeholder}
        className="pl-7"
        {...registration}
      />
    </div>
  );
}

export function ProductFormDrawer({
  open,
  product,
  categories,
  onClose,
  onSave,
}: ProductFormDrawerProps) {
  const [imageBroken, setImageBroken] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      grade: "",
      material: "",
      brand: "",
      categoryId: categories[0]?.id ?? "",
      description: "",
      packaging: "Jumbo Bags",
      unit: "MT",
      moq: 10,
      availableQty: "" as unknown as number,
      location: "",
      sellingPrice: "" as unknown as number,
      marketPrice: "" as unknown as number,
      internalCost: "" as unknown as number,
      deliveryCharge: "" as unknown as number,
      imageUrl: "",
      publishStatus: "DRAFT",
    },
  });

  const imageUrl = form.watch("imageUrl");
  const unit = form.watch("unit");
  const publishStatus = form.watch("publishStatus");
  const packagingOptions = PACKAGING_OPTIONS.includes(
    form.watch("packaging") as (typeof PACKAGING_OPTIONS)[number],
  )
    ? PACKAGING_OPTIONS
    : ([form.watch("packaging"), ...PACKAGING_OPTIONS] as string[]);
  const unitOptions = UNIT_OPTIONS.includes(
    unit as (typeof UNIT_OPTIONS)[number],
  )
    ? UNIT_OPTIONS
    : ([unit, ...UNIT_OPTIONS] as string[]);

  useEffect(() => {
    setImageBroken(false);
  }, [imageUrl]);

  useEffect(() => {
    if (!open) return;
    if (!product) {
      form.reset({
        name: "",
        grade: "",
        material: "",
        brand: "",
        categoryId: categories[0]?.id ?? "",
        description: "",
        packaging: "Jumbo Bags",
        unit: "MT",
        moq: 10,
        availableQty: "" as unknown as number,
        location: "",
        sellingPrice: "" as unknown as number,
        marketPrice: "" as unknown as number,
        internalCost: "" as unknown as number,
        deliveryCharge: "" as unknown as number,
        imageUrl: "",
        publishStatus: "DRAFT",
      });
      return;
    }
    form.reset({
      name: product.name,
      grade: product.grade,
      material: product.material,
      brand: product.brand,
      categoryId: product.categoryId,
      description: product.description,
      packaging: product.packaging,
      unit: product.unit,
      moq: product.moq,
      availableQty: product.availableQty,
      location: product.location,
      sellingPrice: product.sellingPrice,
      marketPrice: product.marketPrice,
      internalCost: product.internalCost,
      deliveryCharge: product.deliveryCharge,
      imageUrl: product.images[0] ?? "",
      publishStatus: product.publishStatus,
    });
  }, [categories, form, open, product]);

  return (
    <CxFormDrawer
      open={open}
      onClose={onClose}
      title={product ? "Edit product" : "Add product"}
      description="Fill in the details customers will see. Drafts stay internal until you set status to Live."
      submitLabel={product ? "Save product" : "Create product"}
      widthClassName="w-full max-w-2xl"
      onSubmit={form.handleSubmit(async (values) => {
        await onSave({
          id: product?.id,
          name: values.name,
          grade: values.grade,
          material: values.material,
          brand: values.brand,
          categoryId: values.categoryId,
          description: values.description,
          packaging: values.packaging,
          unit: values.unit,
          moq: values.moq,
          availableQty: values.availableQty,
          location: values.location,
          sellingPrice: values.sellingPrice,
          marketPrice: values.marketPrice,
          internalCost: values.internalCost,
          deliveryCharge: values.deliveryCharge,
          images: [values.imageUrl],
          publishStatus: values.publishStatus as PublishStatus,
          active: values.publishStatus === "LIVE",
          deliveryAvailable: true,
        });
        onClose();
      })}
    >
      <Section
        title="Product details"
        description="Name, grade and category shown on the customer catalog."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Product name"
            htmlFor="product-name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              id="product-name"
              placeholder="e.g. PP H110MA"
              {...form.register("name")}
            />
          </Field>
          <Field
            label="Grade"
            htmlFor="product-grade"
            required
            error={form.formState.errors.grade?.message}
          >
            <Input
              id="product-grade"
              placeholder="e.g. H110MA"
              {...form.register("grade")}
            />
          </Field>
          <Field
            label="Material"
            htmlFor="product-material"
            required
            error={form.formState.errors.material?.message}
          >
            <Input
              id="product-material"
              placeholder="e.g. Polypropylene"
              {...form.register("material")}
            />
          </Field>
          <Field
            label="Brand"
            htmlFor="product-brand"
            required
            error={form.formState.errors.brand?.message}
          >
            <Input
              id="product-brand"
              placeholder="e.g. Reliance Industries"
              {...form.register("brand")}
            />
          </Field>
        </div>
        <Field
          label="Category"
          required
          error={form.formState.errors.categoryId?.message}
        >
          <Select
            value={form.watch("categoryId")}
            onValueChange={(value) =>
              form.setValue("categoryId", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Customer-facing description"
          htmlFor="product-description"
          required
          error={form.formState.errors.description?.message}
        >
          <Textarea
            id="product-description"
            rows={3}
            className="min-h-[88px] resize-y"
            placeholder="What buyers will read on the product page."
            {...form.register("description")}
          />
        </Field>
      </Section>

      <Section
        title="Inventory & fulfilment"
        description="Stock, packaging and where the material ships from."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="MOQ"
            htmlFor="product-moq"
            required
            hint={`Minimum order in ${unit || "units"}`}
            error={form.formState.errors.moq?.message}
          >
            <Input
              id="product-moq"
              type="number"
              min={1}
              step="1"
              placeholder="10"
              {...form.register("moq")}
            />
          </Field>
          <Field
            label="Available qty"
            htmlFor="product-qty"
            hint="Leave blank if stock is unknown"
            error={form.formState.errors.availableQty?.message}
          >
            <Input
              id="product-qty"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              {...form.register("availableQty")}
            />
          </Field>
          <Field label="Unit" required>
            <Select
              value={unit}
              onValueChange={(value) =>
                form.setValue("unit", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Packaging" required>
            <Select
              value={form.watch("packaging")}
              onValueChange={(value) =>
                form.setValue("packaging", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select packaging" />
              </SelectTrigger>
              <SelectContent>
                {packagingOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Location"
            htmlFor="product-location"
            required
            error={form.formState.errors.location?.message}
          >
            <Input
              id="product-location"
              list="product-locations"
              placeholder="e.g. Jamnagar, GJ"
              {...form.register("location")}
            />
            <datalist id="product-locations">
              {warehouses.map((warehouse) => (
                <option
                  key={warehouse.id}
                  value={`${warehouse.location} · ${warehouse.name}`}
                />
              ))}
            </datalist>
          </Field>
        </div>
      </Section>

      <Section
        title="Pricing"
        description="Selling price is what customers see. Other amounts stay internal."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={`Selling price / ${unit || "unit"}`}
            htmlFor="product-selling-price"
            required
            error={form.formState.errors.sellingPrice?.message}
          >
            <CurrencyInput
              id="product-selling-price"
              placeholder="e.g. 98500"
              registration={form.register("sellingPrice")}
            />
          </Field>
          <Field label="Market price" htmlFor="product-market-price">
            <CurrencyInput
              id="product-market-price"
              placeholder="Optional"
              registration={form.register("marketPrice")}
            />
          </Field>
          <Field
            label="Internal cost"
            htmlFor="product-internal-cost"
            hint="Not shown to customers"
          >
            <CurrencyInput
              id="product-internal-cost"
              placeholder="Optional"
              registration={form.register("internalCost")}
            />
          </Field>
          <Field label="Delivery charge" htmlFor="product-delivery-charge">
            <CurrencyInput
              id="product-delivery-charge"
              placeholder="0"
              registration={form.register("deliveryCharge")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Media"
        description="Paste a public image URL. A preview appears once the link loads."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div
            className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-white sm:w-28"
            aria-hidden
          >
            {imageUrl && !imageBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImageBroken(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  {imageBroken ? "Broken URL" : "Preview"}
                </span>
              </div>
            )}
          </div>
          <Field
            label="Image URL"
            htmlFor="product-image"
            required
            className="min-w-0 flex-1"
            error={form.formState.errors.imageUrl?.message}
            hint="HTTPS link to a JPG or PNG"
          >
            <Input
              id="product-image"
              placeholder="https://"
              {...form.register("imageUrl")}
            />
          </Field>
        </div>
      </Section>

      <Section title="Publishing">
        <Field label="Publish status" hint={PUBLISH_HINTS[publishStatus]}>
          <Select
            value={publishStatus}
            onValueChange={(value) =>
              form.setValue("publishStatus", value as PublishStatus, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PUBLISH_HINTS) as PublishStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {publishStatus === "LIVE" ? (
          <div className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              This SKU will appear on Customer APP and WEB as soon as you save.
            </p>
          </div>
        ) : (
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <p>
              Keep it as Draft while you finish pricing and imagery. Publish
              later from the catalog table.
            </p>
          </div>
        )}
      </Section>
    </CxFormDrawer>
  );
}
