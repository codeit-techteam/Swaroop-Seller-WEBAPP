import type { ProcurementBuyerOption } from "@/types/procurement";

export const COMMODITIES = [
  "PP",
  "HDPE",
  "LDPE",
  "PVC",
  "PET",
  "LLDPE",
  "Bitumen",
  "Methanol",
] as const;

export const GRADES: Record<string, string[]> = {
  PP: ["H110MA", "Raffia", "Injection"],
  HDPE: ["Blow Grade", "Film Grade", "Pipe Grade"],
  LDPE: ["2420H", "Film Grade"],
  PVC: ["Resin SG5", "K67"],
  PET: ["Bottle Grade", "Fiber Grade"],
  LLDPE: ["F2001P", "Film Grade"],
  Bitumen: ["VG30", "VG40"],
  Methanol: ["Industrial", "Fuel Grade"],
};

export const WAREHOUSES = [
  "Mundra",
  "Hazira",
  "Jamnagar",
  "Dahej",
  "Panipat",
  "Kandla",
];

export const PAYMENT_TERMS = ["LC 30", "LC 45", "LC 60", "Advance", "Net 15"];

export const CREDIT_TERMS = ["Net 15", "Net 30", "Net 45", "LC backed", "Advance"];

export const BUYERS: ProcurementBuyerOption[] = [
  {
    name: "Indorama Ventures",
    company: "Indorama Ventures Ltd",
    location: "Nakhon Pathom / Mundra CFS",
  },
  {
    name: "Time Technoplast",
    company: "Time Technoplast Ltd",
    location: "Daman",
  },
  {
    name: "Uflex Ltd",
    company: "Uflex Limited",
    location: "Noida",
  },
  {
    name: "Finolex Industries",
    company: "Finolex Industries Ltd",
    location: "Pune",
  },
  {
    name: "Supreme Industries",
    company: "The Supreme Industries Ltd",
    location: "Mumbai",
  },
  {
    name: "Ultratech Cement",
    company: "UltraTech Cement Ltd",
    location: "Ahmedabad",
  },
  {
    name: "Haldia Petrochemicals",
    company: "Haldia Petrochemicals Ltd",
    location: "Haldia",
  },
  {
    name: "Jindal Poly",
    company: "Jindal Poly Films Ltd",
    location: "Nashik",
  },
];

export const SELLER_TYPES = [
  "Manufacturer",
  "Trader",
  "Importer",
  "Distributor",
];

export const REJECTION_REASONS = [
  "Price too high",
  "Supplier issue",
  "Quantity mismatch",
  "Compliance issue",
  "Buyer cancelled",
  "Other",
] as const;
