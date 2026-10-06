"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { GradeMasterPicker } from "@/components/grades/grade-master-picker";
import {
  type PendingDoc,
  ProductDocumentsPanel,
} from "@/components/grades/product-documents-panel";
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
import {
  DEFAULT_PACKAGING_TYPE,
  packagingOptions,
} from "@/lib/constants/products";
import { slabsOverlap } from "@/lib/seller/format";
import { apiErrorMessage, buildSellerListingCode } from "@/lib/utils";
import {
  createSellerListing,
  sellerGradeCategoryName,
  sellerGradeLabel,
  type SellerGradeOption,
} from "@/services/catalog";
import { uploadProductDocument } from "@/services/product-documents";
import { useSellerProductStore } from "@/store/sellerProductStore";
import { useSellerStore } from "@/store/sellerStore";
import type { BulkPriceSlab } from "@/types/seller";

const schema = z.object({
  gradeId: z.string().min(1, "Select a grade from the Grade Master"),
  gradeName: z.string().min(1, "Select a grade from the Grade Master"),
  gradeCode: z.string().min(1, "Grade code is required"),
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

export function AddGradeView() {
  const router = useRouter();
  const fetchProducts = useSellerProductStore((s) => s.fetchProducts);
  const addActivity = useSellerStore((s) => s.addActivity);
  const [slabs, setSlabs] = useState<BulkPriceSlab[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<SellerGradeOption | null>(
    null,
  );
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const overlap = useMemo(() => slabsOverlap(slabs), [slabs]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      gradeId: "",
      gradeName: "",
      gradeCode: "",
      application: "",
      mfi: "",
      density: "",
      packagingType: DEFAULT_PACKAGING_TYPE,
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

  const save = async (values: Values, asDraft: boolean) => {
    if (overlap) {
      toast.error("Bulk price ranges cannot overlap");
      return;
    }

    if (!selectedGrade || selectedGrade.id !== values.gradeId) {
      toast.error("Select a grade from the central Grade Master.");
      return;
    }

    let createdProductId: string | null = null;
    try {
      const created = await createSellerListing({
        gradeId: selectedGrade.id,
        name: sellerGradeLabel(selectedGrade),
        code: values.gradeCode,
        manufacturer: selectedGrade.manufacturer ?? undefined,
        mfi: values.mfi,
        density: values.density,
        packaging: values.packagingType,
        unit: values.unit,
        countryOfOrigin: values.origin,
        application: values.application,
        polymerType: sellerGradeCategoryName(selectedGrade) || undefined,
        warehouseName: values.warehouse,
        availableStock: values.availableStock,
        reservedStock: values.reservedStock,
        moq: values.moq,
        sellingPrice: values.sellingPrice,
        priceTiers: slabs.map((s) => ({
          minQty: s.minQty,
          maxQty: s.maxQty,
          price: s.price,
          label: s.discountLabel,
        })),
        notes: values.notes,
        publishToMarketplace: !asDraft,
        gstPercent: values.gstPercent,
      });
      createdProductId = created?.id ?? null;

      if (createdProductId && pendingDocs.length > 0) {
        let uploaded = 0;
        for (const pending of pendingDocs) {
          try {
            await uploadProductDocument(createdProductId, {
              documentType: pending.documentType,
              title: pending.title,
              description: pending.description,
              file: pending.file,
            });
            uploaded += 1;
          } catch {
            toast.error(`Failed to upload ${pending.documentType} to R2`);
          }
        }
        setPendingDocs([]);
        if (uploaded > 0) {
          toast.success(`${uploaded} document(s) stored in Cloudflare R2`);
        }
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Unable to save listing on backend."));
      return;
    }

    await fetchProducts();
    addActivity({
      type: "offer",
      title: asDraft ? "Grade saved as draft" : "Grade added",
      description: values.gradeName,
    });
    toast.success(asDraft ? "Draft saved" : "Grade added");
    router.push(ROUTES.PRODUCTS);
  };

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Add Product / Grade"
        description="Creates a marketplace listing with stock and bulk pricing. TDS/MSDS are optional — customers see verified details without seller identity."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => save(values, false))}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
        >
          <GradeMasterPicker
            selectedGrade={selectedGrade}
            error={form.formState.errors.gradeId?.message}
            onSelect={(grade) => {
              setSelectedGrade(grade);
              form.setValue("gradeId", grade?.id ?? "", {
                shouldValidate: form.formState.isSubmitted,
              });
              form.setValue("gradeName", grade ? sellerGradeLabel(grade) : "");
              // Seller Product.code is unique per org — never reuse bare Grade Master code.
              form.setValue(
                "gradeCode",
                grade ? buildSellerListingCode(grade.code) : "",
              );
            }}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gradeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Name</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      placeholder="Select a grade above"
                      className="bg-slate-50"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[11px] text-slate-500">
                    From the Grade Master.
                  </p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gradeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing / SKU Code</FormLabel>
                  <FormControl>
                    <Input placeholder="P400S-A1B2C" {...field} />
                  </FormControl>
                  <p className="text-[11px] text-slate-500">
                    Auto-generated from Grade Master so each listing is unique.
                    You can edit it.
                  </p>
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
                    <Input placeholder="Raffia, woven sacks" {...field} />
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
                    <Input placeholder="3.5" {...field} />
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
                    <Input placeholder="0.954" {...field} />
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
                      {packagingOptions(field.value).map((item) => (
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
                  <FormLabel>Available Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
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
                    <Input placeholder="China / India" {...field} />
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
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <FormControl>
                    <Input placeholder="Chennai CFS Warehouse" {...field} />
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
                    <Input type="number" {...field} />
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Selling Price
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the commercial selling price for this listing. Credit
                payments are managed by PetroTrade. Seller credit configuration
                is not required.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (₹/MT)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            productId={null}
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
            <Button
              type="button"
              variant="secondary"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit((values) => save(values, true))}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Draft
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add Grade"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
