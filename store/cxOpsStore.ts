import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  auditLogsMock,
  customerNotificationsMock,
  supportTicketsMock,
} from "@/mock/cx-ops";
import {
  auditService,
  notificationService,
  supportService,
} from "@/services/cxOpsService";
import type {
  AuditLogEntry,
  CustomerNotification,
  SupportTicket,
  SupportTicketStatus,
} from "@/types/cx-ops";

interface CxOpsState {
  notifications: CustomerNotification[];
  tickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  sendNotification: (
    input: Omit<CustomerNotification, "id" | "createdAt">,
  ) => Promise<CustomerNotification>;
  addTicketMessage: (id: string, actor: string, body: string) => Promise<void>;
  setTicketStatus: (
    id: string,
    status: SupportTicketStatus,
    assignedAgent?: string,
  ) => Promise<void>;
  getTicket: (id: string) => SupportTicket | undefined;
}

export const useCxOpsStore = create<CxOpsState>()(
  devtools(
    (set, get) => ({
      notifications: customerNotificationsMock,
      tickets: supportTicketsMock,
      auditLogs: auditLogsMock,
      getTicket: (id) =>
        get().tickets.find((row) => row.id === id || row.ticketId === id),
      sendNotification: async (input) => {
        const created = await notificationService.create(input);
        auditService.log({
          actor: "Amit Shah",
          role: "ADMIN",
          action: "NOTIFICATION_SEND",
          entity: "Notification",
          entityId: created.id,
          newValue: created.title,
        });
        set({
          notifications: await notificationService.list(),
          auditLogs: await auditService.list(),
        });
        return created;
      },
      addTicketMessage: async (id, actor, body) => {
        await supportService.addMessage(id, actor, body);
        set({
          tickets: await supportService.list(),
          auditLogs: await auditService.list(),
        });
      },
      setTicketStatus: async (id, status, assignedAgent) => {
        await supportService.setStatus(id, status, assignedAgent);
        set({ tickets: await supportService.list() });
      },
    }),
    { name: "cx-ops-store" },
  ),
);
