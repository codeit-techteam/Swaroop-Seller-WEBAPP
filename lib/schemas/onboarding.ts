import { z } from "zod";

import {
  gstSchema,
  panSchema,
  phoneSchema,
  pincodeSchema,
} from "@/lib/utils/validators";

export const loginSchema = z.object({
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  gstNumber: gstSchema,
  panNumber: panSchema,
  businessType: z.string().min(1, "Business type is required"),
  contactName: z.string().min(1, "Full name is required"),
  designation: z.string().min(1, "Designation is required"),
  phone: phoneSchema,
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  industry: z.string().min(1, "Industry is required"),
  yearsInBusiness: z.string().min(1, "Years in business is required"),
  annualTurnover: z.string().min(1, "Annual turnover is required"),
});

export const gstPanSchema = z.object({
  gstNumber: gstSchema,
  panNumber: panSchema,
});

export const bankSchema = z
  .object({
    accountHolderName: z.string().min(1, "Account holder name is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z
      .string()
      .min(9, "Account number must be at least 9 digits")
      .regex(/^\d+$/, "Account number must contain only digits"),
    confirmAccountNumber: z.string().min(1, "Please confirm account number"),
    ifscCode: z
      .string()
      .min(1, "IFSC code is required")
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
    branchName: z.string().min(1, "Branch name is required"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

export const locationSchema = z.object({
  warehouseAddress: z.string().min(10, "Warehouse address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: pincodeSchema,
  registeredAddress: z.string().min(10, "Registered address is required"),
});

export const reviewSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm the information is correct",
    }),
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type CompanyFormValues = z.infer<typeof companySchema>;
export type GstPanFormValues = z.infer<typeof gstPanSchema>;
export type BankFormValues = z.infer<typeof bankSchema>;
export type LocationFormValues = z.infer<typeof locationSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
