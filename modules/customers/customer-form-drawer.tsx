"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CxFormDrawer, FieldError } from "@/components/cx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOMER_TYPE_LABELS,
  type CustomerDraft,
  type CustomerProfile,
  type CustomerType,
  defaultCustomerDraft,
} from "@/types/customers";

const schema = z.object({
  name: z.string().min(2, "Customer name is required"),
  companyName: z.string().min(2, "Company name is required"),
  customerType: z.enum(["INDIVIDUAL", "CONTRACTOR", "DESIGNER", "BUILDER"]),
  mobile: z.string().min(10, "Valid mobile is required"),
  email: z.string().email("Valid email is required"),
  gstin: z.string().min(5, "GSTIN is required"),
  pan: z.string().min(5, "PAN is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
});

interface CustomerFormDrawerProps {
  open: boolean;
  customer?: CustomerProfile;
  onClose: () => void;
  onSave: (draft: CustomerDraft) => Promise<void> | void;
}

export function CustomerFormDrawer({
  open,
  customer,
  onClose,
  onSave,
}: CustomerFormDrawerProps) {
  const form = useForm<CustomerDraft>({
    resolver: zodResolver(schema),
    defaultValues: defaultCustomerDraft(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      customer
        ? {
            name: customer.name,
            companyName: customer.companyName,
            customerType: customer.customerType,
            mobile: customer.mobile,
            email: customer.email,
            gstin: customer.gstin,
            pan: customer.pan,
            city: customer.city,
            state: customer.state,
            contactPerson: customer.contactPerson,
          }
        : defaultCustomerDraft(),
    );
  }, [customer, form, open]);

  return (
    <CxFormDrawer
      open={open}
      onClose={onClose}
      title={customer ? "Edit customer" : "Add customer"}
      description="Customer-facing profile only. Internal underwriting notes stay on the credit desk."
      submitLabel={customer ? "Update customer" : "Create customer"}
      onSubmit={form.handleSubmit(async (values) => {
        await onSave(values);
        onClose();
      })}
    >
      <div className="space-y-1">
        <Label>Customer name</Label>
        <Input {...form.register("name")} />
        <FieldError message={form.formState.errors.name?.message} />
      </div>
      <div className="space-y-1">
        <Label>Company name</Label>
        <Input {...form.register("companyName")} />
        <FieldError message={form.formState.errors.companyName?.message} />
      </div>
      <div className="space-y-1">
        <Label>Customer type</Label>
        <Select
          value={form.watch("customerType")}
          onValueChange={(value) =>
            form.setValue("customerType", value as CustomerType)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CUSTOMER_TYPE_LABELS) as CustomerType[]).map(
              (type) => (
                <SelectItem key={type} value={type}>
                  {CUSTOMER_TYPE_LABELS[type]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Mobile</Label>
          <Input {...form.register("mobile")} />
          <FieldError message={form.formState.errors.mobile?.message} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>GSTIN</Label>
          <Input {...form.register("gstin")} />
          <FieldError message={form.formState.errors.gstin?.message} />
        </div>
        <div className="space-y-1">
          <Label>PAN</Label>
          <Input {...form.register("pan")} />
          <FieldError message={form.formState.errors.pan?.message} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>City</Label>
          <Input {...form.register("city")} />
          <FieldError message={form.formState.errors.city?.message} />
        </div>
        <div className="space-y-1">
          <Label>State</Label>
          <Input {...form.register("state")} />
          <FieldError message={form.formState.errors.state?.message} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Contact person</Label>
        <Input {...form.register("contactPerson")} />
        <FieldError message={form.formState.errors.contactPerson?.message} />
      </div>
    </CxFormDrawer>
  );
}
