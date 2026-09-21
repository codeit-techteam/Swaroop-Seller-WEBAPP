"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
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
  packagingTypes,
  paymentTermsSummary,
  polymerTypes,
} from "@/lib/mock/products";
import { slabsOverlap } from "@/lib/seller/format";
import { createSellerListing, fetchSellerGrades, type SellerGradeOption } from "@/services/catalog";
import { useLocationStore } from "@/store/locationStore";
import { useSellerProductStore } from "@/store/sellerProductStore";
import { useSellerStore } from "@/store/sellerStore";
import type { BulkPriceSlab } from "@/types/seller";

const schema = z.object({
  category: z.string().min(1, "Select a category"),
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

export function AddGradeView() {
  const router = useRouter();
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const addProduct = useSellerProductStore((s) => s.addProduct);
  const addActivity = useSellerStore((s) => s.addActivity);
  const [slabs, setSlabs] = useState<BulkPriceSlab[]>([]);
  const [grades, setGrades] = useState<SellerGradeOption[]>([]);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const overlap = useMemo(() => slabsOverlap(slabs), [slabs]);

  useEffect(() => {
    void fetchSellerGrades()
      .then((items) => {
        setGrades(items);
        setGradesError(null);
      })
      .catch((error: unknown) => {
        setGrades([]);
        setGradesError(
          error instanceof Error ? error.message : "Unable to load Grade Master.",
        );
      });
  }, []);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
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

  const save = async (values: Values, asDraft: boolean) => {
    if (overlap) {
      toast.error("Bulk price ranges cannot overlap");
      return;
    }

    const selectedGrade = grades.find((item) => item.id === values.category);
    if (!selectedGrade) {
      toast.error("Select a grade from the central Grade Master.");
      return;
    }

    const paymentPricing = {
      sellingPrice: values.sellingPrice,
    };

    try {
      await createSellerListing({
        gradeId: selectedGrade.id,
        name: values.gradeName,
        code: values.gradeCode,
        mfi: values.mfi,
        density: values.density,
        packaging: values.packagingType,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save listing on backend.",
      );
      return;
    }

    addProduct(
      {
        category: selectedGrade.category?.name ?? selectedGrade.name,
        gradeName: values.gradeName,
        manufacturer: values.manufacturer,
        gradeCode: values.gradeCode,
        polymerType: values.polymerType,
        application: values.application,
        mfi: values.mfi,
        density: values.density ?? "",
        packagingType: values.packagingType,
        unit: values.unit,
        availableStock: values.availableStock,
        moq: values.moq,
        origin: values.origin,
        currency: values.currency,
        gstPercent: values.gstPercent,
        warehouse: values.warehouse,
        reservedStock: values.reservedStock,
        notes: values.notes ?? "",
        locationId,
        basePrice: values.sellingPrice,
        paymentPricing,
        paymentTerms: paymentTermsSummary(paymentPricing),
        bulkPricing: slabs,
      },
      asDraft,
    );
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
        description="Structured grade information with a single selling price. Product images are not used on this platform."
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => save(values, false))}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Master</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selected = grades.find((item) => item.id === value);
                      if (selected) {
                        form.setValue("gradeName", selected.displayName ?? selected.name);
                        form.setValue("gradeCode", selected.code);
                        form.setValue("polymerType", selected.category?.code ?? selected.code);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select central grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.displayName ?? item.name}
                          {item.category?.name ? ` · ${item.category.name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {gradesError ? (
                    <p className="text-xs text-red-600">{gradesError}</p>
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
                    <Input placeholder="SCG P400S 3.5mfi" {...field} />
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
                    <Input placeholder="SCG" {...field} />
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
                    <Input placeholder="P400S" {...field} />
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
                      {polymerTypes.map((item) => (
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
                  Quantity bands with a unit price. Leave max empty for open-ended
                  tiers.
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
