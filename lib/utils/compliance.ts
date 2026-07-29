import { format, isToday, isValid, isYesterday, parseISO } from "date-fns";

export function formatComplianceLastUpdated(value: string | null): string {
  if (!value) return "—";
  const date = parseISO(value);
  if (!isValid(date)) return "—";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

export function getExpiryAlertLevel(
  daysUntilExpiry: number | null,
): "none" | "critical" | "warning" | "notice" | "upcoming" {
  if (daysUntilExpiry === null) return "none";
  if (daysUntilExpiry < 0) return "critical";
  if (daysUntilExpiry <= 7) return "critical";
  if (daysUntilExpiry <= 15) return "warning";
  if (daysUntilExpiry <= 30) return "notice";
  if (daysUntilExpiry <= 90) return "upcoming";
  return "none";
}
