"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { ROUTES } from "@/lib/constants";
import { AddSellerDrawer } from "@/modules/procurement";

export default function NewSellerPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  return (
    <AddSellerDrawer
      open={open}
      onClose={() => {
        setOpen(false);
        router.push(ROUTES.PROCUREMENT_QUEUE);
      }}
      onAdded={(name) => {
        toast.success(`${name} saved.`);
        router.push(ROUTES.PROCUREMENT_QUEUE);
      }}
    />
  );
}
