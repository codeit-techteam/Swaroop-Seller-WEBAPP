import { z } from "zod";

export const productFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  productGrade: z.string().min(1, "Product grade is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  originCountry: z.string().min(1, "Origin country is required"),
  description: z.string().optional(),
  inventory: z.object({
    warehouseId: z.string().min(1, "Warehouse is required"),
    availableMt: z.number().min(0, "Available stock must be 0 or more"),
    reservedMt: z.number().min(0),
    moq: z.number().positive("MOQ must be greater than 0"),
    isActive: z.boolean(),
  }),
  pricing: z.object({
    basePrice: z.number().positive("Base price must be greater than 0"),
    advancePrice: z.number().min(0),
    onLoading: z.number().min(0),
    onDelivery: z.number().min(0),
    credit15Days: z.number().min(0),
    credit30Days: z.number().min(0),
  }),
  technicalSpecs: z.object({
    mfi: z.string().optional(),
    density: z.string().optional(),
    application: z.string().optional(),
    materialNotes: z.string().optional(),
  }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const offerFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  allocationMt: z.number().positive("Allocation must be greater than 0"),
  basePrice: z.number().positive("Base price must be greater than 0"),
  moq: z.number().positive("MOQ must be greater than 0"),
  validUntil: z.string().min(1, "Offer validity is required"),
  paymentTerms: z.array(z.string()).min(1, "Select at least one payment term"),
  remarks: z.string().optional(),
});

export type OfferFormValues = z.infer<typeof offerFormSchema>;
