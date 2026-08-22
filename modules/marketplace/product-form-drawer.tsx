"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  FileText,
  Globe,
  ImageIcon,
  Info,
  Package,
  Plus,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { CxFormDrawer, FieldError } from "@/components/cx";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DEFAULT_PAYMENT_TERMS,
  DEFAULT_QUALITY_BADGES,
} from "@/mock/marketplace-cms";
import { warehouses } from "@/mock/products";
import type {
  CatalogCategory,
  CatalogProduct,
  PublishStatus,
} from "@/types/marketplace-cms";

const UNIT_OPTIONS = ["MT", "KG", "Bags", "Drums"] as const;
const PACKAGING_OPTIONS = [
  "25 KG Bags",
  "Jumbo Bags",
  "Drums",
  "Loose",
] as const;

const FORM_TABS = [
  { id: "details", label: "Details", hint: "Identity & stock" },
  { id: "specs", label: "Specs & media", hint: "Tech & gallery" },
  { id: "pricing", label: "Pricing", hint: "Tiers & terms" },
  { id: "publish", label: "Publish", hint: "Go live" },
] as const;

type FormTabId = (typeof FORM_TABS)[number]["id"];

const PUBLISH_HINTS: Record<PublishStatus, string> = {
  DRAFT: "Stays internal. Customers will not see this SKU.",
  PREVIEW: "Internal preview only. Not listed on Customer APP/WEB.",
  PENDING_APPROVAL: "Waiting for approval before it can go live.",
  LIVE: "Visible immediately on Customer APP and Customer WEB.",
  PAUSED: "Hidden from customers until you publish it again.",
  ARCHIVED: "Removed from the customer catalog.",
};

const PRIMARY_STATUSES: PublishStatus[] = ["DRAFT", "PREVIEW", "LIVE"];

const STATUS_META: Record<
  PublishStatus,
  { title: string; icon: typeof FileEdit }
> = {
  DRAFT: { title: "Save as draft", icon: FileEdit },
  PREVIEW: { title: "Preview", icon: Eye },
  LIVE: { title: "Go live", icon: Globe },
  PENDING_APPROVAL: { title: "Pending approval", icon: Info },
  PAUSED: { title: "Paused", icon: Info },
  ARCHIVED: { title: "Archived", icon: Info },
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
  availableQty: z.coerce.number().min(0),
  location: z.string().min(1, "Warehouse is required"),
  origin: z.string().optional(),
  casNumber: z.string().optional(),
  hsnCode: z.string().optional(),
  application: z.string().optional(),
  applications: z.string().optional(),
  industry: z.string().optional(),
  etaLabel: z.string().min(1, "Delivery ETA is required"),
  transportMode: z.string().optional(),
  creditEligible: z.boolean(),
  sellingPrice: z.coerce.number().positive("Selling price is required"),
  marketPrice: z.coerce.number().min(0),
  internalCost: z.coerce.number().min(0),
  deliveryCharge: z.coerce.number().min(0),
  imageUrl: z.string().url("Enter a valid image URL"),
  imageUrl2: z.string().optional(),
  imageUrl3: z.string().optional(),
  publishStatus: z.enum([
    "DRAFT",
    "PREVIEW",
    "PENDING_APPROVAL",
    "LIVE",
    "PAUSED",
    "ARCHIVED",
  ]),
  specifications: z.array(
    z.object({
      label: z.string().min(1, "Label required"),
      value: z.string().min(1, "Value required"),
      standard: z.string().optional(),
    }),
  ),
  bulkPrices: z.array(
    z.object({
      minQty: z.coerce.number().positive(),
      maxQty: z
        .union([z.coerce.number().positive(), z.literal(""), z.nan()])
        .optional(),
      price: z.coerce.number().positive(),
    }),
  ),
  paymentTerms: z.array(
    z.object({
      id: z.enum([
        "advance",
        "on_loading",
        "on_delivery",
        "credit_15",
        "credit_30",
      ]),
      title: z.string(),
      description: z.string(),
      enabled: z.boolean(),
      surchargePct: z.coerce.number().optional(),
      discountPct: z.coerce.number().optional(),
    }),
  ),
  documents: z.array(
    z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      fileName: z.string().min(1),
    }),
  ),
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
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500"
      >
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-hidden>
            *
          </span>
        ) : null}
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
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
        {icon ? (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A]/5 text-[#0B1F3A]">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-5 px-4 py-5 sm:px-5">{children}</div>
    </section>
  );
}

function StepNav({
  active,
  onChange,
}: {
  active: FormTabId;
  onChange: (id: FormTabId) => void;
}) {
  const activeIndex = FORM_TABS.findIndex((tab) => tab.id === active);

  return (
    <nav
      aria-label="Product form steps"
      className="rounded-xl border border-slate-200 bg-slate-50/80 p-1.5"
    >
      <ol className="grid grid-cols-4 gap-1">
        {FORM_TABS.map((tab, index) => {
          const isActive = tab.id === active;
          const isDone = index < activeIndex;

          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-lg px-1.5 py-2.5 text-center transition-colors sm:flex-row sm:items-center sm:gap-2.5 sm:px-2.5 sm:text-left",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : isDone
                      ? "text-slate-700 hover:bg-white/70"
                      : "text-slate-400 hover:bg-white/50 hover:text-slate-600",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    isActive
                      ? "bg-[#0B1F3A] text-white"
                      : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200/80 text-slate-500",
                  )}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold leading-tight sm:text-xs",
                      isActive ? "text-slate-900" : undefined,
                    )}
                  >
                    {tab.label}
                  </span>
                  <span className="mt-0.5 hidden text-[10px] leading-tight text-slate-400 sm:block">
                    {tab.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
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
        className="h-10 bg-white pl-7"
        {...registration}
      />
    </div>
  );
}

function emptyForm(categories: CatalogCategory[]): FormValues {
  return {
    name: "",
    grade: "",
    material: "",
    brand: "",
    categoryId: categories[0]?.id ?? "",
    description: "",
    packaging: "25 KG Bags",
    unit: "MT",
    moq: 25,
    availableQty: 0,
    location: "",
    origin: "",
    casNumber: "",
    hsnCode: "",
    application: "",
    applications: "",
    industry: "Petrochemicals & Packaging",
    etaLabel: "2–3 Days",
    transportMode: "Road Freight (FTL)",
    creditEligible: true,
    sellingPrice: undefined as unknown as number,
    marketPrice: undefined as unknown as number,
    internalCost: undefined as unknown as number,
    deliveryCharge: 0,
    imageUrl: "",
    imageUrl2: "",
    imageUrl3: "",
    publishStatus: "DRAFT",
    specifications: [{ label: "", value: "", standard: "" }],
    bulkPrices: [
      {
        minQty: 25,
        maxQty: "" as unknown as number,
        price: undefined as unknown as number,
      },
    ],
    paymentTerms: DEFAULT_PAYMENT_TERMS.map((term) => ({ ...term })),
    documents: [
      { name: "Certificate of Analysis", type: "COA", fileName: "COA.pdf" },
    ],
  };
}

function productToForm(product: CatalogProduct): FormValues {
  return {
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
    origin: product.origin || product.location,
    casNumber: product.casNumber ?? "",
    hsnCode: product.hsnCode ?? "",
    application: product.application ?? "",
    applications: (product.applications ?? []).join(", "),
    industry: product.industry ?? "Petrochemicals & Packaging",
    etaLabel: product.etaLabel ?? "2–5 Days",
    transportMode: product.transportMode ?? "Road Freight (FTL)",
    creditEligible: product.creditEligible ?? true,
    sellingPrice: product.sellingPrice,
    marketPrice: product.marketPrice,
    internalCost: product.internalCost,
    deliveryCharge: product.deliveryCharge,
    imageUrl: product.images[0] ?? "",
    imageUrl2: product.images[1] ?? "",
    imageUrl3: product.images[2] ?? "",
    publishStatus: product.publishStatus,
    specifications: product.specifications.length
      ? product.specifications.map((row) => ({
          label: row.label,
          value: row.value,
          standard: row.standard ?? "",
        }))
      : [{ label: "", value: "", standard: "" }],
    bulkPrices: product.bulkPrices.length
      ? product.bulkPrices.map((tier) => ({
          minQty: tier.minQty,
          maxQty: (tier.maxQty ?? "") as unknown as number,
          price: tier.price,
        }))
      : [
          {
            minQty: product.moq,
            maxQty: "" as unknown as number,
            price: product.sellingPrice,
          },
        ],
    paymentTerms: (product.paymentTerms?.length
      ? product.paymentTerms
      : DEFAULT_PAYMENT_TERMS
    ).map((term) => ({ ...term })),
    documents: product.documents?.length
      ? product.documents
      : [{ name: "Certificate of Analysis", type: "COA", fileName: "COA.pdf" }],
  };
}

function toFiniteNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildProductPayload(
  values: FormValues,
  status: PublishStatus,
  product?: CatalogProduct,
): Partial<CatalogProduct> & { name: string; grade: string } {
  const images = [values.imageUrl, values.imageUrl2, values.imageUrl3]
    .map((url) => url?.trim())
    .filter(
      (url): url is string =>
        typeof url === "string" && url.length > 0 && /^https?:\/\//i.test(url),
    );
  const applications = (values.applications ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: product?.id,
    name: values.name.trim(),
    grade: values.grade.trim(),
    material: values.material,
    brand: values.brand,
    categoryId: values.categoryId,
    description: values.description,
    packaging: values.packaging,
    unit: values.unit,
    moq: toFiniteNumber(values.moq, 25),
    availableQty: toFiniteNumber(values.availableQty, 0),
    location: values.location,
    origin: values.origin || values.location,
    casNumber: values.casNumber ?? "",
    hsnCode: values.hsnCode ?? "",
    application: values.application || applications[0] || "",
    applications,
    industry: values.industry || "Petrochemicals & Packaging",
    etaLabel: values.etaLabel || "2–3 Days",
    transportMode: values.transportMode || "Road Freight (FTL)",
    creditEligible: values.creditEligible,
    highlights: product?.highlights ?? [
      "PetroTrade Verified",
      "GST Invoice Available",
      "Fast Dispatch",
      values.creditEligible ? "Credit Eligible" : "Advance Preferred",
      "Quality Certified",
    ],
    qualityBadges: product?.qualityBadges ?? [...DEFAULT_QUALITY_BADGES],
    sellingPrice: toFiniteNumber(values.sellingPrice, 0),
    marketPrice: toFiniteNumber(values.marketPrice, 0),
    internalCost: toFiniteNumber(values.internalCost, 0),
    deliveryCharge: toFiniteNumber(values.deliveryCharge, 0),
    images,
    specifications: values.specifications.filter(
      (row) => row.label.trim() && row.value.trim(),
    ),
    bulkPrices: values.bulkPrices.map((tier) => ({
      minQty: toFiniteNumber(tier.minQty, toFiniteNumber(values.moq, 25)),
      maxQty:
        tier.maxQty === "" ||
        tier.maxQty == null ||
        Number.isNaN(Number(tier.maxQty))
          ? null
          : Number(tier.maxQty),
      price: toFiniteNumber(tier.price, toFiniteNumber(values.sellingPrice, 0)),
    })),
    paymentTerms: values.paymentTerms,
    documents: values.documents.filter(
      (doc) => doc.name.trim() && doc.fileName.trim(),
    ),
    publishStatus: status,
    active: status === "LIVE",
    deliveryAvailable: true,
  };
}

function StatusPicker({
  value,
  extra,
  onChange,
}: {
  value: PublishStatus;
  extra: PublishStatus[];
  onChange: (status: PublishStatus) => void;
}) {
  const options = [
    ...PRIMARY_STATUSES,
    ...extra.filter((status) => !PRIMARY_STATUSES.includes(status)),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((status) => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        const selected = value === status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border px-4 py-3.5 text-left transition-colors",
              selected
                ? "border-[#0B1F3A] bg-[#0B1F3A]/[0.04] ring-1 ring-[#0B1F3A]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                selected
                  ? "bg-[#0B1F3A] text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {meta.title}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                {PUBLISH_HINTS[status]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ProductPreviewCard({
  values,
  categoryName,
}: {
  values: FormValues;
  categoryName?: string;
}) {
  const price = toFiniteNumber(values.sellingPrice, 0);
  const enabledTerms = values.paymentTerms.filter((term) => term.enabled);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <Eye className="h-3.5 w-3.5 text-slate-400" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Customer APP / WEB preview
        </p>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {values.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-7 w-7 text-slate-300" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-400">
              {values.brand || "Brand"}
              {categoryName ? ` · ${categoryName}` : ""}
            </p>
            <h4 className="mt-0.5 truncate text-base font-semibold text-slate-900">
              {values.name || "Untitled product"}
            </h4>
            <p className="text-xs text-slate-500">
              {values.grade || "Grade pending"} · {values.packaging} ·{" "}
              {values.unit}
            </p>
            <p className="mt-2 text-lg font-bold text-[#0B1F3A]">
              {price > 0 ? formatCurrency(price) : "Price pending"}
              {price > 0 ? (
                <span className="ml-1 text-xs font-medium text-slate-400">
                  / {values.unit}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {values.description ||
            "Add a customer-facing description to preview this SKU."}
        </p>
        <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
          {[
            ["MOQ", `${values.moq || "—"} ${values.unit}`],
            ["Stock", `${values.availableQty || 0} ${values.unit}`],
            ["ETA", values.etaLabel || "—"],
            ["Warehouse", values.location || "—"],
          ].map(([label, val]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-0.5 truncate font-medium text-slate-800">
                {val}
              </p>
            </div>
          ))}
        </div>
        {enabledTerms.length ? (
          <div className="flex flex-wrap gap-1.5">
            {enabledTerms.map((term) => (
              <span
                key={term.id}
                className="rounded-full bg-[#0B1F3A] px-2 py-0.5 text-[10px] font-medium text-white"
              >
                {term.title}
              </span>
            ))}
          </div>
        ) : null}
      </div>
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
  const [tab, setTab] = useState<FormTabId>("details");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm(categories),
  });

  const specsArray = useFieldArray({
    control: form.control,
    name: "specifications",
  });
  const bulkArray = useFieldArray({
    control: form.control,
    name: "bulkPrices",
  });
  const docsArray = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const imageUrl = form.watch("imageUrl");
  const unit = form.watch("unit");
  const publishStatus = form.watch("publishStatus");
  const sellingPrice = form.watch("sellingPrice");
  const internalCost = form.watch("internalCost");
  const paymentTerms = form.watch("paymentTerms");

  const tabIndex = FORM_TABS.findIndex((item) => item.id === tab);
  const isFirstTab = tabIndex <= 0;
  const isLastTab = tabIndex >= FORM_TABS.length - 1;

  const marginPreview = useMemo(() => {
    const sell = Number(sellingPrice) || 0;
    const cost = Number(internalCost) || 0;
    const margin = sell - cost;
    const pct = sell ? (margin / sell) * 100 : 0;
    return { margin, pct };
  }, [internalCost, sellingPrice]);

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
    setTab("details");
    setPreviewOpen(false);
    form.reset(product ? productToForm(product) : emptyForm(categories));
  }, [categories, form, open, product]);

  const goPrev = () => {
    if (previewOpen) {
      setPreviewOpen(false);
      return;
    }
    if (isFirstTab) return;
    const prev = FORM_TABS[tabIndex - 1];
    if (prev) setTab(prev.id);
  };

  const goNext = () => {
    if (isLastTab) return;
    const next = FORM_TABS[tabIndex + 1];
    if (next) setTab(next.id);
  };

  const persist = async (values: FormValues, status: PublishStatus) => {
    setSubmitting(true);
    try {
      await onSave(buildProductPayload(values, status, product));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    const values = form.getValues();
    if (!values.name?.trim() || values.name.trim().length < 2) {
      form.setError("name", {
        message: "Product name is required to save a draft",
      });
      setPreviewOpen(false);
      setTab("details");
      return;
    }
    if (!values.grade?.trim()) {
      form.setError("grade", {
        message: "Grade is required to save a draft",
      });
      setPreviewOpen(false);
      setTab("details");
      return;
    }
    form.setValue("publishStatus", "DRAFT");
    await persist(values, "DRAFT");
  };

  const savePreview = async () => {
    const values = form.getValues();
    if (!values.name?.trim() || values.name.trim().length < 2) {
      form.setError("name", { message: "Product name is required to preview" });
      setPreviewOpen(false);
      setTab("details");
      return;
    }
    form.setValue("publishStatus", "PREVIEW");
    await persist(values, "PREVIEW");
  };

  const openPreview = () => {
    form.setValue("publishStatus", "PREVIEW");
    setTab("publish");
    setPreviewOpen(true);
  };

  const submitPrimary = form.handleSubmit(
    async (values) => {
      const status = (values.publishStatus || "LIVE") as PublishStatus;
      await persist(values, status);
    },
    (errors) => {
      const detailKeys = [
        "name",
        "grade",
        "material",
        "brand",
        "categoryId",
        "description",
        "packaging",
        "unit",
        "moq",
        "location",
        "etaLabel",
      ];
      const specKeys = ["imageUrl", "specifications", "documents"];
      const priceKeys = ["sellingPrice", "bulkPrices"];
      setPreviewOpen(false);
      if (detailKeys.some((key) => key in errors)) setTab("details");
      else if (specKeys.some((key) => key in errors)) setTab("specs");
      else if (priceKeys.some((key) => key in errors)) setTab("pricing");
      else setTab("publish");
    },
  );

  const extraStatuses: PublishStatus[] =
    product && !PRIMARY_STATUSES.includes(product.publishStatus)
      ? [product.publishStatus]
      : [];

  const submitLabel = previewOpen
    ? "Save preview"
    : product
      ? publishStatus === "LIVE"
        ? "Save & publish"
        : publishStatus === "PREVIEW"
          ? "Save preview"
          : "Save product"
      : publishStatus === "LIVE"
        ? "Create product"
        : publishStatus === "PREVIEW"
          ? "Save preview"
          : "Save as draft";

  const showDraftButton =
    !previewOpen && !(isLastTab && publishStatus === "DRAFT");
  const showCreateButton = previewOpen || isLastTab;

  const categoryName = categories.find(
    (item) => item.id === form.watch("categoryId"),
  )?.name;

  return (
    <CxFormDrawer
      open={open}
      onClose={onClose}
      title={product ? "Edit product" : "Add product"}
      description="Fill these fields to power the Customer APP/WEB product page — details, specs, bulk tiers, and payment terms."
      submitLabel={submitLabel}
      submitting={submitting}
      widthClassName="w-full max-w-3xl"
      hideSubmit={!showCreateButton}
      footerStart={
        showDraftButton ? (
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={submitting}
            onClick={() => void saveAsDraft()}
          >
            <FileEdit className="h-4 w-4" />
            Save as draft
          </Button>
        ) : null
      }
      footerEnd={
        <>
          {!isFirstTab || previewOpen ? (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={goPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : null}
          {previewOpen ? null : (
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={openPreview}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          )}
          {!isLastTab && !previewOpen ? (
            <Button
              type="button"
              variant="secondary"
              className="gap-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200"
              onClick={goNext}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </>
      }
      onSubmit={() => {
        if (previewOpen || publishStatus === "PREVIEW") {
          void savePreview();
          return;
        }
        if (publishStatus === "DRAFT") {
          void saveAsDraft();
          return;
        }
        void submitPrimary();
      }}
    >
      {previewOpen ? (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Customer preview
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              This is how the SKU will look internally. It will not appear on
              Customer APP/WEB until you create / publish it.
            </p>
          </div>
          <ProductPreviewCard
            values={form.watch()}
            categoryName={categoryName}
          />
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setPreviewOpen(false);
            setTab(value as FormTabId);
          }}
          className="w-full space-y-5"
        >
          <StepNav active={tab} onChange={setTab} />

          <TabsContent value="details" className="mt-0 space-y-5">
            <Section
              title="Product details"
              description="Shown on the customer product page header and info card."
              icon={<Package className="h-4 w-4" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Product name"
                  htmlFor="product-name"
                  required
                  error={form.formState.errors.name?.message}
                >
                  <Input
                    id="product-name"
                    placeholder="e.g. PP H110MA"
                    className="h-10 bg-white"
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
                    className="h-10 bg-white"
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
                    className="h-10 bg-white"
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
                    className="h-10 bg-white"
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
                  <SelectTrigger className="h-10 bg-white">
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
                  className="min-h-[96px] resize-y bg-white"
                  placeholder="What buyers will read on the product page."
                  {...form.register("description")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CAS number" htmlFor="product-cas">
                  <Input
                    id="product-cas"
                    placeholder="e.g. 9003-07-0"
                    className="h-10 bg-white"
                    {...form.register("casNumber")}
                  />
                </Field>
                <Field label="HSN code" htmlFor="product-hsn">
                  <Input
                    id="product-hsn"
                    placeholder="e.g. 3902.10.00"
                    className="h-10 bg-white"
                    {...form.register("hsnCode")}
                  />
                </Field>
                <Field label="Primary application" htmlFor="product-app">
                  <Input
                    id="product-app"
                    placeholder="e.g. Woven sacks"
                    className="h-10 bg-white"
                    {...form.register("application")}
                  />
                </Field>
                <Field label="Industry" htmlFor="product-industry">
                  <Input
                    id="product-industry"
                    placeholder="Petrochemicals & Packaging"
                    className="h-10 bg-white"
                    {...form.register("industry")}
                  />
                </Field>
              </div>
              <Field
                label="Applications"
                htmlFor="product-apps"
                hint="Comma-separated list shown on the customer PDP"
              >
                <Input
                  id="product-apps"
                  placeholder="Woven sacks, Industrial packaging"
                  className="h-10 bg-white"
                  {...form.register("applications")}
                />
              </Field>
            </Section>

            <Section
              title="Inventory & fulfilment"
              description="Stock, packaging and logistics shown to customers."
              icon={<Truck className="h-4 w-4" />}
            >
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-3">
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
                    placeholder="25"
                    className="h-10 bg-white"
                    {...form.register("moq")}
                  />
                </Field>
                <Field
                  label="Available qty"
                  htmlFor="product-qty"
                  error={form.formState.errors.availableQty?.message}
                >
                  <Input
                    id="product-qty"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    className="h-10 bg-white"
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
                    <SelectTrigger className="h-10 bg-white">
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
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <Field label="Packaging" required>
                  <Select
                    value={form.watch("packaging")}
                    onValueChange={(value) =>
                      form.setValue("packaging", value, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 bg-white">
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
                  label="Delivery ETA"
                  htmlFor="product-eta"
                  required
                  error={form.formState.errors.etaLabel?.message}
                >
                  <Input
                    id="product-eta"
                    placeholder="e.g. 2–3 Days"
                    className="h-10 bg-white"
                    {...form.register("etaLabel")}
                  />
                </Field>
                <Field
                  label="Warehouse"
                  htmlFor="product-location"
                  required
                  error={form.formState.errors.location?.message}
                >
                  <Input
                    id="product-location"
                    list="product-locations"
                    placeholder="e.g. Jamnagar, GJ"
                    className="h-10 bg-white"
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
                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 sm:col-span-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                      Credit eligible
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Enables credit payment options on PDP
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("creditEligible")}
                    onCheckedChange={(checked) =>
                      form.setValue("creditEligible", checked)
                    }
                  />
                </div>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="specs" className="mt-0 space-y-4">
            <Section
              title="Technical specifications"
              description="Shown in the customer Technical Specifications accordion."
              icon={<FileText className="h-4 w-4" />}
            >
              <div className="space-y-2.5">
                {specsArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <Input
                      placeholder="Label e.g. MFI"
                      className="h-10 bg-white"
                      {...form.register(`specifications.${index}.label`)}
                    />
                    <Input
                      placeholder="Value e.g. 3.5 g/10 min"
                      className="h-10 bg-white"
                      {...form.register(`specifications.${index}.value`)}
                    />
                    <Input
                      placeholder="Standard e.g. ASTM D1238"
                      className="h-10 bg-white"
                      {...form.register(`specifications.${index}.standard`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => specsArray.remove(index)}
                      disabled={specsArray.fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  specsArray.append({ label: "", value: "", standard: "" })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add specification
              </Button>
            </Section>

            <Section
              title="Media gallery"
              description="Primary image is required. Extra URLs become PDP thumbnails."
              icon={<ImageIcon className="h-4 w-4" />}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div
                  className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 sm:w-32"
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
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        {imageBroken ? "Broken URL" : "Preview"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <Field
                    label="Primary image URL"
                    htmlFor="product-image"
                    required
                    error={form.formState.errors.imageUrl?.message}
                    hint="HTTPS link to a JPG or PNG"
                  >
                    <Input
                      id="product-image"
                      placeholder="https://"
                      className="h-10 bg-white"
                      {...form.register("imageUrl")}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Gallery image 2" htmlFor="product-image-2">
                      <Input
                        id="product-image-2"
                        placeholder="Optional"
                        className="h-10 bg-white"
                        {...form.register("imageUrl2")}
                      />
                    </Field>
                    <Field label="Gallery image 3" htmlFor="product-image-3">
                      <Input
                        id="product-image-3"
                        placeholder="Optional"
                        className="h-10 bg-white"
                        {...form.register("imageUrl3")}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Compliance documents"
              description="Listed under Compliance & Documents on the customer PDP."
              icon={<FileText className="h-4 w-4" />}
            >
              <div className="space-y-2.5">
                {docsArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[1fr_100px_1fr_auto]"
                  >
                    <Input
                      placeholder="Title"
                      className="h-10 bg-white"
                      {...form.register(`documents.${index}.name`)}
                    />
                    <Input
                      placeholder="Type"
                      className="h-10 bg-white"
                      {...form.register(`documents.${index}.type`)}
                    />
                    <Input
                      placeholder="file.pdf"
                      className="h-10 bg-white"
                      {...form.register(`documents.${index}.fileName`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => docsArray.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  docsArray.append({ name: "", type: "COA", fileName: "" })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add document
              </Button>
            </Section>
          </TabsContent>

          <TabsContent value="pricing" className="mt-0 space-y-4">
            <Section
              title="Spot & internal pricing"
              description="Selling price is the customer spot price. Cost and margin stay on this desk."
              icon={<Tag className="h-4 w-4" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Field label="Freight / MT" htmlFor="product-delivery-charge">
                  <CurrencyInput
                    id="product-delivery-charge"
                    placeholder="0"
                    registration={form.register("deliveryCharge")}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-900">
                <span>
                  Margin{" "}
                  <strong className="font-semibold">
                    {formatCurrency(marginPreview.margin)}
                  </strong>
                </span>
                <span className="text-emerald-700/50">·</span>
                <span>
                  Margin %{" "}
                  <strong className="font-semibold">
                    {marginPreview.pct.toFixed(1)}%
                  </strong>
                </span>
              </div>
            </Section>

            <Section
              title="Bulk pricing tiers"
              description="Volume bands on the customer purchase panel. Leave max blank for open-ended tiers."
              icon={<Tag className="h-4 w-4" />}
            >
              <div className="space-y-2.5">
                <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400 sm:grid">
                  <span>Min {unit || "qty"}</span>
                  <span>Max {unit || "qty"}</span>
                  <span>Price / {unit || "unit"}</span>
                  <span className="w-10" />
                </div>
                {bulkArray.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <Input
                      type="number"
                      min={1}
                      placeholder="Min"
                      className="h-10 bg-white"
                      {...form.register(`bulkPrices.${index}.minQty`)}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Max (blank = +)"
                      className="h-10 bg-white"
                      {...form.register(`bulkPrices.${index}.maxQty`)}
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="h-10 bg-white pl-7"
                        placeholder="Price"
                        {...form.register(`bulkPrices.${index}.price`)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => bulkArray.remove(index)}
                      disabled={bulkArray.fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  bulkArray.append({
                    minQty: Number(form.getValues("moq")) || 25,
                    maxQty: "" as unknown as number,
                    price: Number(form.getValues("sellingPrice")) || 0,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add tier
              </Button>
            </Section>

            <Section
              title="Payment options"
              description="Toggle which terms appear on the customer PDP."
              icon={<Tag className="h-4 w-4" />}
            >
              <div className="space-y-2.5">
                {paymentTerms.map((term, index) => (
                  <div
                    key={term.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {term.title}
                        {term.discountPct ? (
                          <span className="ml-2 text-xs font-semibold text-emerald-600">
                            −{term.discountPct}%
                          </span>
                        ) : null}
                        {term.surchargePct ? (
                          <span className="ml-2 text-xs font-semibold text-amber-600">
                            +{term.surchargePct}%
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {term.description}
                      </p>
                    </div>
                    <Switch
                      checked={term.enabled}
                      onCheckedChange={(checked) =>
                        form.setValue(`paymentTerms.${index}.enabled`, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="publish" className="mt-0 space-y-5">
            <Section
              title="Status"
              description="Save as draft while you finish, preview internally, or go live on Customer APP/WEB."
              icon={<Info className="h-4 w-4" />}
            >
              <StatusPicker
                value={publishStatus}
                extra={extraStatuses}
                onChange={(status) => {
                  form.setValue("publishStatus", status, {
                    shouldValidate: true,
                  });
                }}
              />
              <div
                className={cn(
                  "flex gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed",
                  publishStatus === "LIVE"
                    ? "border-blue-100 bg-blue-50 text-blue-800"
                    : publishStatus === "PREVIEW"
                      ? "border-violet-100 bg-violet-50 text-violet-800"
                      : "border-slate-200 bg-slate-50 text-slate-600",
                )}
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {publishStatus === "LIVE"
                    ? "Create product will publish this SKU immediately on Customer APP and WEB."
                    : publishStatus === "PREVIEW"
                      ? "Preview saves internally so your team can review the customer page before going live."
                      : "Save as draft keeps this SKU internal. You can preview or publish it later from the catalog."}
                </p>
              </div>
            </Section>
            <ProductPreviewCard
              values={form.watch()}
              categoryName={categoryName}
            />
          </TabsContent>
        </Tabs>
      )}
    </CxFormDrawer>
  );
}
