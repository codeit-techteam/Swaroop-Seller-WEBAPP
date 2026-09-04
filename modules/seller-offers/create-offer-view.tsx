"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import { slabsOverlap } from "@/lib/seller/format";
import { useLocationStore } from "@/store/locationStore";
import { useSellerOfferStore } from "@/store/sellerOfferStore";
import { useSellerProductStore } from "@/store/sellerProductStore";
import { useSellerStore } from "@/store/sellerStore";
import type { BulkPriceSlab } from "@/types/seller";

const schema = z.object({
  productId: z.string().min(1, "Choose a grade"),
  price: z.coerce.number().positive("Enter a price"),
  unit: z.string().min(1),
  validityHours: z.coerce.number().min(1),
  availableQty: z.coerce.number().min(1),
  moq: z.coerce.number().min(1),
  deliveryLocation: z.string().min(1),
  paymentTerms: z.string().min(1),
  remarks: z.string().optional(),
  gstPercent: z.coerce.number().min(0),
});

type Values = z.infer<typeof schema>;

export function CreateOfferView() {
  const router = useRouter();
  const params = useSearchParams();
  const preselected = params.get("productId") ?? "";
  const location = useLocationStore((s) => s.getSelectedLocation());
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const products = useSellerProductStore((s) => s.products);
  const createOffer = useSellerOfferStore((s) => s.createOffer);
  const addActivity = useSellerStore((s) => s.addActivity);
  const grades = products.filter((item) => item.locationId === locationId);
  const [slabs, setSlabs] = useState<BulkPriceSlab[]>([]);
  const overlap = useMemo(() => slabsOverlap(slabs), [slabs]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: preselected,
      price: 0,
      unit: "kg",
      validityHours: 24,
      availableQty: 100,
      moq: 20,
      deliveryLocation: location?.name ?? "Chennai",
      paymentTerms: "Advance",
      remarks: "",
      gstPercent: 18,
    },
  });

  const save = (values: Values, asDraft: boolean) => {
    if (overlap) {
      toast.error("Bulk price ranges cannot overlap");
      return;
    }
    const offer = createOffer(
      {
        ...values,
        remarks: values.remarks ?? "",
        bulkPricing: slabs,
      },
      locationId,
      asDraft,
    );
    if (!offer) {
      toast.error("Select a valid grade");
      return;
    }
    addActivity({
      type: "offer",
      title: asDraft ? "Offer saved as draft" : "Offer created",
      description: offer.gradeName,
    });
    toast.success(asDraft ? "Draft saved" : "Offer created successfully");
    router.push(ROUTES.OFFERS);
  };

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Add New Offer"
        description={`Publishing against ${location?.name ?? "current location"}`}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => save(values, false))}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
        >
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose a Grade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.category} · {grade.gradeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹/kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
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
                  <FormLabel>GST</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <p className="text-xs text-slate-500">18% applicable</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Quantity (MT)</FormLabel>
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
                  <FormLabel>MOQ (MT)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validityHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Validity (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="deliveryLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Bulk Pricing</h2>
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
                      maxQty: current.length === 0 ? 49 : null,
                      price: Number(form.getValues("price")) || 0,
                    },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Bulk Price
              </Button>
            </div>
            {overlap ? (
              <p className="mb-2 text-sm text-red-600">
                Quantity ranges overlap. Adjust min/max values.
              </p>
            ) : null}
            <div className="space-y-2">
              {slabs.map((slab) => (
                <div key={slab.id} className="grid grid-cols-8 gap-2">
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
                    step="0.1"
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
                    aria-label="Slab price"
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
                    aria-label="Delete slab"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.OFFERS)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit((values) => save(values, true))}
            >
              Save Draft
            </Button>
            <Button type="submit">Add Offer</Button>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
