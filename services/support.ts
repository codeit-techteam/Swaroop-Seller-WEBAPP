import { apiClient } from "@/services/apiClient";

export type SellerTicketCategory =
  | "ORDERS"
  | "PAYMENT"
  | "DISPATCH"
  | "INVENTORY"
  | "COMPLIANCE"
  | "ACCOUNT"
  | "TECHNICAL"
  | "OTHERS";

export type SellerTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SellerTicketStatus =
  "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";

export type SellerSupportTicket = {
  id: string;
  ticketNumber: string;
  ticketId?: string;
  category: SellerTicketCategory | string;
  categoryLabel: string;
  priority: SellerTicketPriority | string;
  status: SellerTicketStatus | string;
  subject: string;
  description: string;
  attachmentName?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{
    id: string;
    sender: string;
    senderName: string;
    body: string;
    createdAt: string;
  }>;
};

type Envelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const SELLER_TICKET_CATEGORIES: Array<{
  value: SellerTicketCategory;
  label: string;
}> = [
  { value: "ORDERS", label: "Order" },
  { value: "PAYMENT", label: "Payment" },
  { value: "DISPATCH", label: "Dispatch" },
  { value: "INVENTORY", label: "Inventory" },
  { value: "COMPLIANCE", label: "Documents" },
  { value: "ACCOUNT", label: "Account" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "OTHERS", label: "Other" },
];

export async function listSellerSupportTickets(): Promise<
  SellerSupportTicket[]
> {
  const { data } = await apiClient.get<Envelope<SellerSupportTicket[]>>(
    "/seller/support/tickets?limit=100",
  );
  return data.data ?? [];
}

export async function createSellerSupportTicket(input: {
  category: SellerTicketCategory;
  priority?: SellerTicketPriority;
  subject: string;
  description: string;
  attachmentName?: string;
}): Promise<SellerSupportTicket> {
  const { data } = await apiClient.post<Envelope<SellerSupportTicket>>(
    "/seller/support/tickets",
    {
      category: input.category,
      priority: input.priority ?? "MEDIUM",
      subject: input.subject.trim(),
      description: input.description.trim(),
      attachmentName: input.attachmentName,
    },
  );
  if (!data.data) {
    throw new Error(data.message || "Failed to create support ticket");
  }
  return data.data;
}

export async function getSellerSupportTicket(
  id: string,
): Promise<SellerSupportTicket> {
  const { data } = await apiClient.get<Envelope<SellerSupportTicket>>(
    `/seller/support/tickets/${id}`,
  );
  if (!data.data) {
    throw new Error("Support ticket not found");
  }
  return data.data;
}
