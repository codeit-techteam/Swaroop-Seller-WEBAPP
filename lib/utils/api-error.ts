import { isAxiosError } from "axios";

/** NestJS / Axios error message for seller toasts. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string | string[]; code?: string }>(error)) {
    const payload = error.response?.data;
    const message = payload?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message) && message[0]) return String(message[0]);
    if (!error.response) {
      return "Network error. Check your connection and try again.";
    }
    if (error.response.status === 409) {
      return "This listing conflicts with an existing product for your seller account.";
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Unique seller SKU from Grade Master code (avoids org+code unique 409). */
export function buildSellerListingCode(gradeCode: string): string {
  const base =
    gradeCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 28) || "SKU";
  const suffix = Date.now().toString(36).toUpperCase().slice(-5);
  return `${base}-${suffix}`;
}
