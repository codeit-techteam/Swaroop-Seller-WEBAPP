/** First letters of up to two name parts, e.g. "Amit Shah" → "AS". */
export function getInitials(name: string, fallback = "PT"): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;

  return parts
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
