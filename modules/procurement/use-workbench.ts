"use client";

import { isSellerRole } from "@/config/roles";
import { matchesSeller } from "@/modules/procurement/selectors";
import { useAuthStore } from "@/store/authStore";
import { useProcurementStore } from "@/store/procurementStore";

export function useWorkbench() {
  const user = useAuthStore((s) => s.user);
  const items = useProcurementStore((s) => s.items);
  const isSeller = isSellerRole(user?.role ?? "ADMIN");
  const sellerId = isSeller ? user?.sellerId : undefined;
  const visibleItems = isSeller
    ? items.filter((item) => matchesSeller(item, sellerId))
    : items;

  return {
    user,
    isSeller,
    isAdmin: !isSeller,
    sellerId,
    items: visibleItems,
    allItems: items,
  };
}
