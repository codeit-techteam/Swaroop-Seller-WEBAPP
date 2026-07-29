import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatDate(
  value: string | Date,
  pattern = "dd MMM yyyy",
): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "";
  return format(date, pattern);
}

export function formatDateTime(
  value: string | Date,
  pattern = "dd MMM yyyy, hh:mm a",
): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "";
  return format(date, pattern);
}

export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}
