"use client";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventoryStore";

interface MarketplaceOfferButtonProps {
  className?: string;
  label?: string;
}

export function MarketplaceOfferButton({
  className,
  label = "Create Marketplace Offer",
}: MarketplaceOfferButtonProps) {
  const selectedProduct = useInventoryStore((s) => s.selectedProduct);
  const offerModalOpen = useInventoryStore((s) => s.offerModalOpen);
  const setOfferModalOpen = useInventoryStore((s) => s.setOfferModalOpen);

  return (
    <>
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          className={cn(
            "h-11 w-full bg-[#1B6EF3] text-sm font-semibold hover:bg-[#1558C8]",
            className,
          )}
          onClick={() => setOfferModalOpen(true)}
        >
          {label}
        </Button>
      </motion.div>

      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Marketplace Offer</DialogTitle>
            <DialogDescription>
              Confirm creating a marketplace offer for{" "}
              <span className="font-semibold text-slate-800">
                {selectedProduct?.productName ?? "selected product"}
              </span>
              {selectedProduct
                ? ` at ₹${selectedProduct.offerPrice.toLocaleString("en-IN")}/MT.`
                : "."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#1B6EF3] hover:bg-[#1558C8]"
              onClick={() => {
                setOfferModalOpen(false);
                toast.success("Marketplace offer created successfully (mock)");
              }}
            >
              Confirm Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
