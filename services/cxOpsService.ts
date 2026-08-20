import { nextId, nowIso } from "@/lib/cx";
import {
  auditLogsMock,
  customerNotificationsMock,
  supportTicketsMock,
} from "@/mock/cx-ops";
import type {
  AuditLogEntry,
  CustomerNotification,
  SupportTicketStatus,
} from "@/types/cx-ops";

let notifications = [...customerNotificationsMock];
let tickets = [...supportTicketsMock];
let logs = [...auditLogsMock];

export const notificationService = {
  async list() {
    return notifications;
  },
  async create(input: Omit<CustomerNotification, "id" | "createdAt">) {
    const next: CustomerNotification = {
      ...input,
      id: nextId("cn"),
      createdAt: nowIso(),
    };
    notifications = [next, ...notifications];
    return next;
  },
};

export const supportService = {
  async list() {
    return tickets;
  },
  async get(id: string) {
    return tickets.find((row) => row.id === id || row.ticketId === id);
  },
  async addMessage(id: string, actor: string, body: string) {
    tickets = tickets.map((ticket) =>
      ticket.id === id
        ? {
            ...ticket,
            updatedAt: nowIso(),
            status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
            messages: [
              ...ticket.messages,
              {
                id: nextId("msg"),
                at: nowIso(),
                actor,
                role: "AGENT",
                body,
              },
            ],
          }
        : ticket,
    );
    return tickets.find((row) => row.id === id);
  },
  async setStatus(
    id: string,
    status: SupportTicketStatus,
    assignedAgent?: string,
  ) {
    tickets = tickets.map((ticket) =>
      ticket.id === id
        ? {
            ...ticket,
            status,
            assignedAgent: assignedAgent ?? ticket.assignedAgent,
            updatedAt: nowIso(),
          }
        : ticket,
    );
    return tickets.find((row) => row.id === id);
  },
};

export const auditService = {
  async list() {
    return logs;
  },
  log(entry: Omit<AuditLogEntry, "id" | "at"> & { at?: string }) {
    const next: AuditLogEntry = {
      ...entry,
      id: nextId("aud"),
      at: entry.at ?? nowIso(),
    };
    logs = [next, ...logs];
    return next;
  },
};
