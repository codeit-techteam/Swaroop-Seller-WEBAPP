import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number");

export const gstSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Enter a valid GST number",
  );

export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN number");

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode");

export const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`);

export const optionalString = z.string().optional();

export const positiveNumber = z
  .number({ invalid_type_error: "Must be a number" })
  .positive("Must be greater than zero");

export const nonNegativeNumber = z
  .number({ invalid_type_error: "Must be a number" })
  .nonnegative("Must be zero or greater");
