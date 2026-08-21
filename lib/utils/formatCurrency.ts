const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(
  value: number,
  options?: { currency?: string; locale?: string },
): string {
  if (options?.currency || options?.locale) {
    return new Intl.NumberFormat(options.locale ?? "en-IN", {
      style: "currency",
      currency: options.currency ?? "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return currencyFormatter.format(value);
}

export function formatCompactInr(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(1)} Cr`;
  }

  // Keep marketplace unit prices as full INR so catalog/pricing desks stay precise.
  return `${sign}${formatCurrency(abs)}`;
}
