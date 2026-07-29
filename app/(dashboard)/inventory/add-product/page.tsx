import type { Metadata } from "next";

import { AddProductView } from "@/modules/products";

export const metadata: Metadata = {
  title: "Add New Product | PetroTrade Seller",
  description: "Add new product grades and inventory for trading",
};

export default function AddProductPage() {
  return <AddProductView />;
}
