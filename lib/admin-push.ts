import { ADMIN_API_URL } from "@/lib/constants";
import { useSellerNotificationStore } from "@/store/sellerNotificationStore";
import type { NotificationCategory, SellerNotification } from "@/types/seller";

export interface AdminPushPayload {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  platforms: string[];
  ctaText?: string;
  ctaAction: string;
  deepLink: string;
  sentAt: string;
  audience: "CUSTOMER" | "SELLER";
}

const CATEGORY_MAP: Record<string, NotificationCategory> = {
  ANNOUNCEMENT: "offers",
  PROMOTION: "offers",
  OFFER: "offers",
  ORDER: "orders",
  PAYMENT: "payments",
  DOCUMENT: "documents",
  KYC: "documents",
  SYSTEM: "requests",
};

export function adminPushToSellerNotification(item: AdminPushPayload): SellerNotification {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    category: CATEGORY_MAP[item.category] ?? "offers",
    read: false,
    createdAt: item.sentAt,
    href: item.deepLink || "/dashboard",
  };
}

export async function fetchAdminSellerPushes(): Promise<AdminPushPayload[]> {
  const response = await fetch(
    `${ADMIN_API_URL}/api/push-notifications?audience=seller&status=SENT`,
    { cache: "no-store" },
  );
  if (!response.ok) return [];
  const payload = (await response.json()) as { data?: AdminPushPayload[] };
  return payload.data ?? [];
}

export async function hydrateAdminPushInbox() {
  try {
    const items = await fetchAdminSellerPushes();
    if (items.length === 0) return 0;
    const mapped = items.map(adminPushToSellerNotification);
    return useSellerNotificationStore.getState().ingestAdminPushes(mapped);
  } catch {
    return 0;
  }
}
