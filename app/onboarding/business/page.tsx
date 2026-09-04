"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { useOnboardingStore } from "@/store/onboardingStore";

const schema = z.object({
  sellerType: z.string().min(1, "Select seller type"),
  yearsInBusiness: z.string(),
  primaryCategories: z.string(),
  operatingCapacity: z.string().min(1, "Operating capacity is required"),
  monthlyTradingCapacity: z
    .string()
    .min(1, "Monthly trading capacity is required"),
  paymentTerms: z.string(),
  preferredContactMethod: z.string(),
});

type Values = z.infer<typeof schema>;

const OPTIONAL_FIELDS = new Set([
  "yearsInBusiness",
  "primaryCategories",
  "paymentTerms",
  "preferredContactMethod",
]);

export default function OnboardingBusinessPage() {
  const router = useRouter();
  const business = useOnboardingStore((s) => s.business);
  const updateBusiness = useOnboardingStore((s) => s.updateBusiness);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: business,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          updateBusiness(values);
          markStepComplete("business");
          setCurrentStep("locations");
          toast.success("Business details saved");
          router.push(ROUTES.ONBOARDING_LOCATIONS);
        })}
        className="space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold">Business Details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Help buyers understand how you operate.
          </p>
        </div>
        <FormField
          control={form.control}
          name="sellerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Distributor", "Trader", "Manufacturer", "Stockist"].map(
                    (item) => (
                      <SelectItem key={item} value={item.toLowerCase()}>
                        {item}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["yearsInBusiness", "Years in Business"],
              ["primaryCategories", "Primary Commodity Categories"],
              ["operatingCapacity", "Operating Capacity (MT)"],
              ["monthlyTradingCapacity", "Monthly Trading Capacity (MT)"],
              ["paymentTerms", "Payment Terms"],
              ["preferredContactMethod", "Preferred Contact Method"],
            ] as const
          ).map(([name, label]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {label}
                    {OPTIONAL_FIELDS.has(name) ? (
                      <span className="font-normal text-slate-400">
                        {" "}
                        (Optional)
                      </span>
                    ) : null}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
