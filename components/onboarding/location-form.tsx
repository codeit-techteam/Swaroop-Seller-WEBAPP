"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
import { Textarea } from "@/components/ui/textarea";
import {
  type LocationFormValues,
  locationSchema,
} from "@/lib/schemas/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { OnboardingStepId } from "@/types/onboarding";

interface OnboardingLocationFormProps {
  title: string;
  subtitle: string;
  nextRoute: string;
  nextStep: OnboardingStepId;
}

export function OnboardingLocationForm({
  title,
  subtitle,
  nextRoute,
  nextStep,
}: OnboardingLocationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewSuffix = searchParams.get("preview") === "1" ? "?preview=1" : "";
  const location = useOnboardingStore((s) => s.location);
  const company = useOnboardingStore((s) => s.company);
  const updateLocation = useOnboardingStore((s) => s.updateLocation);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      warehouseAddress: location.warehouseAddress,
      registeredAddress:
        location.registeredAddress || company.registeredAddress,
      additionalAddresses: (location.additionalAddresses ?? []).map((item) => ({
        label: item.label,
        address: item.address,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalAddresses",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          updateLocation({
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            warehouseAddress: values.warehouseAddress,
            registeredAddress: values.registeredAddress,
            additionalAddresses: values.additionalAddresses.map(
              (item, index) => ({
                id:
                  location.additionalAddresses?.[index]?.id ??
                  crypto.randomUUID(),
                label: item.label ?? "",
                address: item.address,
              }),
            ),
            locationVerified: true,
          });
          updateCompany({ registeredAddress: values.registeredAddress });
          markStepComplete("location");
          markStepComplete("locations");
          setCurrentStep(nextStep);
          toast.success("Location saved");
          router.push(`${nextRoute}${previewSuffix}`);
        })}
        className="space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <FormField
          control={form.control}
          name="registeredAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registered Address</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Official registered office address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
              ["warehouseAddress", "Warehouse / Stock Point"],
            ] as const
          ).map(([name, label]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Additional addresses
              </p>
              <p className="text-xs text-slate-500">
                Add godowns, branches, or other stock points if needed.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", address: "" })}
            >
              <Plus className="h-4 w-4" />
              Add address
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-400">
              No additional addresses yet.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      Address {index + 2}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`additionalAddresses.${index}.label`}
                    render={({ field: labelField }) => (
                      <FormItem>
                        <FormLabel>
                          Label
                          <span className="font-normal text-slate-400">
                            {" "}
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Branch office, Godown"
                            {...labelField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`additionalAddresses.${index}.address`}
                    render={({ field: addressField }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...addressField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
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
