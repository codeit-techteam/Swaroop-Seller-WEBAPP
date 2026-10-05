"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import {
  type PendingDoc,
  ProductDocumentsPanel,
} from "@/components/grades/product-documents-panel";
import { SearchSelect } from "@/components/import/import-ui";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/lib/constants";
import { packagingTypes, polymerTypes, withCurrent } from "@/lib/mock/products";
import { slabsOverlap } from "@/lib/seller/format";
import { apiErrorMessage } from "@/lib/utils";
import {
  fetchSellerProduct,
  searchSellerGrades,
  sellerGradeHint,
  sellerGradeLabel,
  updateSellerListing,
} from "@/services/catalog";
import { uploadProductDocument } from "@/services/product-documents";
import { useSellerProductStore } from "@/store/sellerProductStore";
import type { BulkPriceSlab } from "@/types/seller";

/** Keep bulk tiers aligned with selling price so customers don't see stale rates. */
function syncSlabsToSellingPrice(
  slabs: BulkPriceSlab[],
  previousBase: number,
  nextBase: number,
): BulkPriceSlab[] {
  if (!slabs.length || nextBase <= 0) return slabs;
  if (previousBase > 0 && Math.abs(previousBase - nextBase) < 0.01)
    return slabs;

  const matchedOldBase = slabs.some(
    (s) => previousBase > 0 && Math.abs(s.price - previousBase) < 0.01,
  );
  if (matchedOldBase) {
    return slabs.map((s) =>
      Math.abs(s.price - previousBase) < 0.01 ? { ...s, price: nextBase } : s,
    );
  }

  const baseTierId = [...slabs].sort((a, b) => a.minQty - b.minQty)[0]?.id;
  return slabs.map((s) =>
    s.id === baseTierId ? { ...s, price: nextBase } : s,
  );
}

const schema = z.object({
  gradeId: z.string().min(1, "Select a grade"),
  gradeName: z.string().min(2, "Grade name is required"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  gradeCode: z.string().min(1, "Grade code is required"),
  polymerType: z.string().min(1, "Required"),
  application: z.string().min(2, "Required"),
  mfi: z.string().min(1, "Required"),
  density: z.string().optional(),
  packagingType: z.string().min(1, "Required"),
  unit: z.enum(["MT", "kg"]),
  availableStock: z.coerce.number().min(0),
  moq: z.coerce.number().min(1),
  origin: z.string().min(2, "Origin is required"),
  currency: z.string().min(1),
  gstPercent: z.coerce.number().min(0),
  warehouse: z.string().min(1),
  reservedStock: z.coerce.number().min(0),
  notes: z.string().optional(),
  sellingPrice: z.coerce.number().min(0.01, "Selling price is required"),
});

type Values = z.infer<typeof schema>;

export function EditGradeView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fetchProducts = useSellerProductStore((s) => s.fetchProducts);
  const [slabs, setSlabs] = useState<BulkPriceSlab[]>([]);
  const [loadedBasePrice, setLoadedBasePrice] = useState(0);
  const [wasPublished, setWasPublished] = useState(true);
  const [gradeLabel, setGradeLabel] = useState<string | null>(null);
  const [gradeInactive, setGradeInactive] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const overlap = useMemo(() => slabsOverlap(slabs), [slabs]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      gradeId: "",
      gradeName: "",
      manufacturer: "",
      gradeCode: "",
      polymerType: "",
      application: "",
      mfi: "",
      density: "",
      packagingType: "25 kg bags",
      unit: "MT",
      availableStock: 0,
      origin: "India",
      currency: "INR",
      gstPercent: 18,
      warehouse: "",
      reservedStock: 0,
      moq: 20,
      notes: "",
      sellingPrice: 0,
    },
  });

  const loadGrades = useCallback(async (search: string) => {
    const items = await searchSellerGrades(search);
    return items.map((item) => ({
      value: item.id,
      label: sellerGradeLabel(item),
      hint: sellerGradeHint(item),
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load listing for edit
    setLoading(true);
    setLoadError(null);
    void fetchSellerProduct(params.id)
      .then((product) => {
        if (cancelled) return;
        form.reset({
          gradeId: product.gradeId ?? "",
          gradeName: product.gradeName,
          manufacturer: product.manufacturer,
          gradeCode: product.gradeCode,
          polymerType: product.polymerType,
          application: product.application,
          mfi: product.mfi,
          density: product.density ?? "",
          packagingType: product.packagingType,
          unit: product.unit,
          availableStock: product.availableStock,
          origin: product.origin ?? "India",
          currency: product.currency ?? "INR",
          gstPercent: product.gstPercent ?? 18,
          warehouse: product.warehouse ?? "",
          reservedStock: product.reservedStock,
          moq: product.moq || 20,
          notes: product.notes ?? "",
          sellingPrice: product.basePrice ?? 0,
        });
        setGradeLabel(product.gradeLabel ?? null);
        setGradeInactive(
          Boolean(product.gradeStatus) && product.gradeStatus !== "ACTIVE",
        );
        setLoadedBasePrice(product.basePrice ?? 0);
        setWasPublished(product.offerStatus === "active");
        setSlabs(product.bulkPricing ?? []);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "Unable to load grade.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form, params.id]);

  const save = async (values: Values) => {
    if (overlap) {
      toast.error("Bulk price ranges cannot overlap");
      return;
    }
    if (!values.gradeId) {
      toast.error("Select a grade from the Grade Master.");
      return;
    }

    try {
      const syncedSlabs = syncSlabsToSellingPrice(
        slabs,
        loadedBasePrice,
        values.sellingPrice,
      );
      if (syncedSlabs !== slabs) setSlabs(syncedSlabs);

      await updateSellerListing(params.id, {
        gradeId: values.gradeId,
        name: values.gradeName,
        code: values.gradeCode,
        manufacturer: values.manufacturer,
        mfi: values.mfi,
        density: values.density,
        packaging: values.packagingType,
        unit: values.unit,
        countryOfOrigin: values.origin,
        application: values.application,
        polymerType: values.polymerType,
        warehouseName: values.warehouse,
        availableStock: values.availableStock,
        reservedStock: values.reservedStock,
        moq: values.moq,
        sellingPrice: values.sellingPrice,
        priceTiers: syncedSlabs.map((s) => ({
          minQty: s.minQty,
          maxQty: s.maxQty ?? undefined,
          price: s.price,
          label: s.discountLabel,
        })),
        notes: values.notes,
        publishToMarketplace: wasPublished,
        gstPercent: values.gstPercent,
      });

      if (pendingDocs.length > 0) {
        let uploaded = 0;
        for (const pending of pendingDocs) {
          try {
            await uploadProductDocument(params.id, {
              documentType: pending.documentType,
              title: pending.title,
              description: pending.description,
              file: pending.file,
            });
            uploaded += 1;
          } catch {
            toast.error(`Failed to upload ${pending.documentType}`);
          }
        }
        setPendingDocs([]);
        if (uploaded > 0) {
          toast.success(`${uploaded} document(s) stored`);
        }
      }

      await fetchProducts();
      toast.success("Grade updated — price synced to marketplace");
      router.push(ROUTES.PRODUCTS);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to update grade."));
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Edit Grade" description="Loading…" />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading grade…
        </div>
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer>
        <PageHeader title="Edit Grade" description={loadError} />
        <Button onClick={() => router.push(ROUTES.PRODUCTS)}>Back</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Edit Grade"
        description="Update stock, pricing, bulk tiers, and optional TDS/MSDS. Changes sync to the blind marketplace."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(save)}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Master</FormLabel>
                  <FormControl>
                    <SearchSelect
                      value={field.value}
                      selectedLabel={gradeLabel}
                      placeholder="Search grade, grade no. or manufacturer"
                      queryKey={["seller", "grade-master"]}
                      load={loadGrades}
                      onChange={(value, option) => {
                        field.onChange(value ?? "");
                        setGradeLabel(option?.label ?? null);
                        setGradeInactive(false);
                      }}
                    />
                  </FormControl>
                  {gradeInactive ? (
                    <p className="text-xs text-amber-700">
                      This grade has been deactivated in the Grade Master.
                      Choose an active grade to save changes.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer / Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gradeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="polymerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Polymer Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {withCurrent(polymerTypes, field.value).map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="application"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mfi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MFI / Technical Parameter</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="density"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Density (g/cm3)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="packagingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packaging Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packagingTypes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Stock (MT)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.001" {...field} />
                  </FormControl>
                  <p className="text-xs text-slate-500">
                    Set to 0 when out of stock. You can update this anytime
                    after creating the grade.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <FormControl>
                    <Input placeholder="Kolkata CFS Warehouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reservedStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reserved Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moq"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gstPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST %</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Selling Price
            </h2>
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price (₹/MT)</FormLabel>
                  <FormControl>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="pl-7"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          const next = Number(e.target.value) || 0;
                          setSlabs((current) =>
                            syncSlabsToSellingPrice(
                              current,
                              loadedBasePrice,
                              next,
                            ),
                          );
                          if (next > 0) setLoadedBasePrice(next);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Bulk Pricing Tiers
                </h2>
                <p className="text-xs text-slate-500">
                  Quantity bands with a unit price. Leave max empty for
                  open-ended tiers.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSlabs((current) => [
                    ...current,
                    {
                      id: `bp-${Date.now()}`,
                      minQty: current.length === 0 ? 1 : 50,
                      maxQty: current.length === 0 ? 10 : null,
                      price: Number(form.getValues("sellingPrice")) || 0,
                      discountLabel: current.length === 0 ? "Standard" : "",
                    },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Tier
              </Button>
            </div>
            {overlap ? (
              <p className="mb-2 text-sm text-red-600">
                Quantity ranges overlap. Adjust min/max values.
              </p>
            ) : null}
            {slabs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                No volume tiers yet. Add a tier to offer quantity-based pricing.
              </p>
            ) : (
              <div className="space-y-2">
                {slabs.map((slab) => (
                  <div
                    key={slab.id}
                    className="grid grid-cols-12 items-center gap-2"
                  >
                    <Input
                      type="number"
                      className="col-span-2"
                      value={slab.minQty}
                      onChange={(event) =>
                        setSlabs((current) =>
                          current.map((item) =>
                            item.id === slab.id
                              ? { ...item, minQty: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      aria-label="Minimum quantity"
                      placeholder="Min MT"
                    />
                    <Input
                      type="number"
                      className="col-span-2"
                      value={slab.maxQty ?? ""}
                      placeholder="Max"
                      onChange={(event) =>
                        setSlabs((current) =>
                          current.map((item) =>
                            item.id === slab.id
                              ? {
                                  ...item,
                                  maxQty: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                }
                              : item,
                          ),
                        )
                      }
                      aria-label="Maximum quantity"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      className="col-span-3"
                      value={slab.price}
                      onChange={(event) =>
                        setSlabs((current) =>
                          current.map((item) =>
                            item.id === slab.id
                              ? { ...item, price: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                      aria-label="Tier price"
                      placeholder="₹/MT"
                    />
                    <Input
                      className="col-span-4"
                      value={slab.discountLabel ?? ""}
                      onChange={(event) =>
                        setSlabs((current) =>
                          current.map((item) =>
                            item.id === slab.id
                              ? { ...item, discountLabel: event.target.value }
                              : item,
                          ),
                        )
                      }
                      aria-label="Discount label"
                      placeholder="Standard / Save ₹3/MT"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSlabs((current) =>
                          current.filter((item) => item.id !== slab.id),
                        )
                      }
                      aria-label="Delete tier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <ProductDocumentsPanel
            productId={params.id}
            pendingFiles={pendingDocs}
            onPendingChange={setPendingDocs}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.PRODUCTS)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
