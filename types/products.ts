export type ProductCategory =
  | "Polymers - Polyethylene"
  | "Polymers - Polypropylene"
  | "Polymers - PVC"
  | "Polymers - ABS"
  | "Polymers - LDPE"
  | "Polymers - HDPE";

export type UploadFileType = "image" | "tds" | "coa";

export type UploadStatus = "empty" | "uploading" | "uploaded" | "error";

export interface ProductUpload {
  id: string;
  type: UploadFileType;
  label: string;
  description: string;
  acceptedFormats: string;
  status: UploadStatus;
  fileName?: string;
  fileSize?: number;
  previewUrl?: string;
  uploadProgress?: number;
  errorMessage?: string;
}

export interface ProductPricing {
  basePrice: number;
  advancePrice: number;
  onLoading: number;
  onDelivery: number;
  credit15Days: number;
  credit30Days: number;
}

export interface ProductInventory {
  warehouseId: string;
  warehouseName: string;
  availableMt: number;
  reservedMt: number;
  moq: number;
  stockUnit: string;
  isActive: boolean;
}

export interface ProductTechnicalSpecs {
  mfi: string;
  density: string;
  application: string;
  materialNotes: string;
}

export interface ProductFormData {
  category: string;
  productGrade: string;
  manufacturer: string;
  originCountry: string;
  description: string;
  uploads: ProductUpload[];
  inventory: ProductInventory;
  pricing: ProductPricing;
  technicalSpecs: ProductTechnicalSpecs;
}

export interface Product extends ProductFormData {
  id: string;
  sku: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  lastSavedAt?: string;
}

export const defaultProductUploads = (): ProductUpload[] => [
  {
    id: "upload-image",
    type: "image",
    label: "Product Image",
    description: "PNG, JPG up to 5MB",
    acceptedFormats: "image/png,image/jpeg",
    status: "empty",
  },
  {
    id: "upload-tds",
    type: "tds",
    label: "Technical Datasheet (TDS)",
    description: "PDF format preferred",
    acceptedFormats: "application/pdf",
    status: "empty",
  },
  {
    id: "upload-coa",
    type: "coa",
    label: "Quality Cert. (COA)",
    description: "Certified Batch Records",
    acceptedFormats: "application/pdf",
    status: "empty",
  },
];

export const defaultProductFormData = (): ProductFormData => ({
  category: "",
  productGrade: "",
  manufacturer: "",
  originCountry: "",
  description: "",
  uploads: defaultProductUploads(),
  inventory: {
    warehouseId: "",
    warehouseName: "",
    availableMt: 0,
    reservedMt: 0,
    moq: 25,
    stockUnit: "Metric Tons",
    isActive: true,
  },
  pricing: {
    basePrice: 0,
    advancePrice: 0,
    onLoading: 0,
    onDelivery: 0,
    credit15Days: 0,
    credit30Days: 0,
  },
  technicalSpecs: {
    mfi: "",
    density: "",
    application: "",
    materialNotes: "",
  },
});
