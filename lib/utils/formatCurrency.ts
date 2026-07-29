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
