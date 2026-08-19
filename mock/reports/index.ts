import type { OperationsReport } from "@/types/reports";

export const reportsMock: OperationsReport[] = [
  {
    id: "rpt-1",
    name: "Daily Operations Pack",
    module: "Operations",
    period: "15 May 2024",
    generatedAt: "2024-05-15T07:00:00.000Z",
    status: "READY",
    owner: "Ananya Mehta",
  },
  {
    id: "rpt-2",
    name: "Procurement Cycle Time",
    module: "Procurement",
    period: "WTD",
    generatedAt: "2024-05-15T08:10:00.000Z",
    status: "GENERATING",
    owner: "Rohit Kulkarni",
  },
  {
    id: "rpt-3",
    name: "Receivables Aging",
    module: "Finance",
    period: "Apr 2024",
    generatedAt: "2024-05-02T11:20:00.000Z",
    status: "READY",
    owner: "Neha Iyer",
  },
  {
    id: "rpt-4",
    name: "Dispatch SLA Breach",
    module: "Logistics",
    period: "May 2024",
    generatedAt: "2024-05-14T18:40:00.000Z",
    status: "FAILED",
    owner: "Sanjay Patel",
  },
];
