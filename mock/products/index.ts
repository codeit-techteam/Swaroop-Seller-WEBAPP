import type { Product } from "@/types/products";

export const productCategories = [
  "Polymers - Polyethylene",
  "Polymers - Polypropylene",
  "Polymers - PVC",
  "Polymers - ABS",
  "Polymers - LDPE",
  "Polymers - HDPE",
] as const;

export const originCountries = [
  "Saudi Arabia",
  "India",
  "UAE",
  "Singapore",
  "South Korea",
  "USA",
  "Qatar",
] as const;

export interface WarehouseOption {
  id: string;
  name: string;
  location: string;
}

export const warehouses: WarehouseOption[] = [
  { id: "wh-hazira", name: "Hazira Port Terminal", location: "Gujarat" },
  { id: "wh-mundra", name: "Mundra SEZ Terminal", location: "Gujarat" },
  { id: "wh-jnpt", name: "JNPT Logistics Hub", location: "Maharashtra" },
  { id: "wh-kandla", name: "Kandla Port Depot", location: "Gujarat" },
  { id: "wh-dahej", name: "Dahej Industrial Zone", location: "Gujarat" },
  { id: "wh-panipat", name: "Panipat Refinery Yard", location: "Haryana" },
  { id: "wh-mumbai", name: "Mumbai HQ Warehouse", location: "Maharashtra" },
];

export interface ProductCatalogItem {
  id: string;
  name: string;
  grade: string;
  subtext: string;
  category: string;
  manufacturer: string;
  originCountry: string;
  warehouseId: string;
  availableMt: number;
  basePrice: number;
}

export const productCatalog: ProductCatalogItem[] = [
  {
    id: "prod-pp-h110",
    name: "Polypropylene PP H110MA",
    grade: "PP H110MA",
    subtext: "Homopolymer Injection",
    category: "Polymers - Polypropylene",
    manufacturer: "Reliance Industries",
    originCountry: "India",
    warehouseId: "wh-hazira",
    availableMt: 450,
    basePrice: 94500,
  },
  {
    id: "prod-lldpe-f2001",
    name: "LLDPE F2001",
    grade: "LLDPE F2001",
    subtext: "Film Grade High Toughness",
    category: "Polymers - Polyethylene",
    manufacturer: "SABIC",
    originCountry: "Saudi Arabia",
    warehouseId: "wh-mundra",
    availableMt: 320,
    basePrice: 112000,
  },
  {
    id: "prod-hdpe-pe100",
    name: "HDPE PE100",
    grade: "HDPE PE100",
    subtext: "Pipe Grade Black",
    category: "Polymers - HDPE",
    manufacturer: "ExxonMobil",
    originCountry: "Singapore",
    warehouseId: "wh-jnpt",
    availableMt: 280,
    basePrice: 98500,
  },
  {
    id: "prod-pvc-k67",
    name: "PVC Resin K-67",
    grade: "PVC K-67",
    subtext: "Suspension Resin",
    category: "Polymers - PVC",
    manufacturer: "Chemplast Sanmar",
    originCountry: "India",
    warehouseId: "wh-kandla",
    availableMt: 190,
    basePrice: 86900,
  },
  {
    id: "prod-abs-750",
    name: "ABS Grade 750",
    grade: "ABS 750",
    subtext: "General Purpose Injection",
    category: "Polymers - ABS",
    manufacturer: "LG Chem",
    originCountry: "South Korea",
    warehouseId: "wh-dahej",
    availableMt: 145,
    basePrice: 134500,
  },
  {
    id: "prod-ldpe-2420",
    name: "LDPE 2420H",
    grade: "LDPE 2420H",
    subtext: "Film Grade",
    category: "Polymers - LDPE",
    manufacturer: "Reliance Industries",
    originCountry: "India",
    warehouseId: "wh-panipat",
    availableMt: 210,
    basePrice: 108200,
  },
];

export const productsMock: Product[] = [];
