export type ReportStatus = "READY" | "GENERATING" | "FAILED";

export interface OperationsReport {
  id: string;
  name: string;
  module: string;
  period: string;
  generatedAt: string;
  status: ReportStatus;
  owner: string;
}
