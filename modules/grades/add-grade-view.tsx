"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  polymerTypes,
  productCategories,
} from "@/lib/mock/products";
import { useLocationStore } from "@/store/locationStore";
import { useSellerProductStore } from "@/store/sellerProductStore";
import { useSellerStore } from "@/store/sellerStore";

const schema = z.object({
  category: z.string().min(1, "Select a category"),
  gradeName: z.string().min(2, "Grade name is required"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  gradeCode: z.string().min(1, "Grade code is required"),
  polymerType: z.string().min(1, "Required"),
  application: z.string().min(2, "Required"),
  mfi: z.string().min(1, "Required"),
  packagingType: z.string().min(1, "Required"),
  unit: z.enum(["MT", "kg"]),
  availableStock: z.coerce.number().min(0),
  moq: z.coerce.number().min(1),
  origin: z.string().min(2, "Origin is required"),
  basePrice: z.coerce.number().min(0),
  currency: z.string().min(1),
  gstPercent: z.coerce.number().min(0),
  paymentTerms: z.string().min(1),
  warehouse: z.string().min(1),
  reservedStock: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function AddGradeView() {
  const router = useRouter();
  const locationId = useLocationStore((s) => s.selectedLocationId);
  const addProduct = useSellerProductStore((s) => s.addProduct);
  const addActivity = useSellerStore((s) => s.addActivity);

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
      packagingType: "25 kg bags",
      unit: "MT",
      availableStock: 0,
      origin: "India",
      basePrice: 0,
      currency: "INR",
      gstPercent: 18,
      paymentTerms: "Advance",
      warehouse: "",
      reservedStock: 0,
      moq: 20,
      notes: "",
    },
  });

  const save = (values: Values, asDraft: boolean) => {
    addProduct(
      {
        ...values,
        notes: values.notes ?? "",
        locationId,
        unit: values.unit,
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
        description="Structured grade information only. Product images are not used on this platform."
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
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productCategories.map((item) => (
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
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
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
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input placeholder="Advance" {...field} />
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Add Grade
            </Button>
          </div>
        </form>
      </Form>
    </PageContainer>
  );
}
