"use client";

import { useState } from "react";

import { ActionDrawer } from "@/components/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { COMMODITIES, PAYMENT_TERMS, SELLER_TYPES } from "@/modules/procurement/catalog";
import { useUsersStore } from "@/store/usersStore";
import type { KycBadge, SupplierStatus } from "@/types/users";

interface AddSellerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdded: (name: string) => void;
}

interface SellerForm {
  name: string;
  legalName: string;
  sellerType: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  pan: string;
  cin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  commodities: string[];
  paymentTerms: string;
  creditAvailable: boolean;
  moq: string;
  gstStatus: string;
  kyc: KycBadge;
  documentsStatus: string;
}

const emptyForm: SellerForm = {
  name: "",
  legalName: "",
  sellerType: "Manufacturer",
  contactPerson: "",
  phone: "",
  email: "",
  gstin: "",
  pan: "",
  cin: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  commodities: ["PP"],
  paymentTerms: "LC 45",
  creditAvailable: true,
  moq: "50",
  gstStatus: "VERIFIED",
  kyc: "PENDING",
  documentsStatus: "PENDING",
};

export function AddSellerDrawer({
  open,
  onClose,
  onAdded,
}: AddSellerDrawerProps) {
  const addSupplier = useUsersStore((s) => s.addSupplier);
  const [form, setForm] = useState<SellerForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = <K extends keyof SellerForm>(key: K, value: SellerForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  const submit = (asDraft: boolean) => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Company name is required.";
    if (!asDraft && !form.gstin.trim()) next.gstin = "GSTIN is required.";
    if (!asDraft && !form.contactPerson.trim()) {
      next.contactPerson = "Contact person is required.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    addSupplier({
      id: `sup-${Date.now()}`,
      name: form.name.trim(),
      legalName: form.legalName.trim() || form.name.trim(),
      sellerType: form.sellerType,
      contactPerson: form.contactPerson,
      phone: form.phone,
      email: form.email,
      gstin: form.gstin.trim() || "PENDING",
      pan: form.pan,
      cin: form.cin,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      location: [form.city, form.state].filter(Boolean).join(", ") || "India",
      commodities: form.commodities.join(", "),
      status: (asDraft ? "ONBOARDING" : "ACTIVE") as SupplierStatus,
      kyc: form.kyc,
      creditLimit: form.creditAvailable ? 1_00_00_000 : 0,
      lastActive: "Just now",
      paymentTerms: form.paymentTerms,
      creditAvailable: form.creditAvailable,
      moq: `${form.moq} MT`,
      gstStatus: form.gstStatus,
      documentsStatus: form.documentsStatus,
    });
    const name = form.name.trim();
    resetAndClose();
    onAdded(name);
  };

  return (
    <ActionDrawer
      open={open}
      onClose={resetAndClose}
      title="Add Seller / Supplier"
      widthClassName="w-full max-w-2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => submit(true)}>
            Save as Draft
          </Button>
          <Button
            className="bg-[#1B6EF3] hover:bg-[#1558C8]"
            onClick={() => submit(false)}
          >
            Add Seller
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Business Information
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Company Name</Label>
              <Input
                className="mt-1.5"
                value={form.name}
                onChange={(event) => patch("name", event.target.value)}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              ) : null}
            </div>
            <div>
              <Label>Legal Business Name</Label>
              <Input
                className="mt-1.5"
                value={form.legalName}
                onChange={(event) => patch("legalName", event.target.value)}
              />
            </div>
            <div>
              <Label>Seller Type</Label>
              <Select
                value={form.sellerType}
                onValueChange={(value) => patch("sellerType", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELLER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input
                className="mt-1.5"
                value={form.contactPerson}
                onChange={(event) => patch("contactPerson", event.target.value)}
              />
              {errors.contactPerson ? (
                <p className="mt-1 text-xs text-red-600">{errors.contactPerson}</p>
              ) : null}
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1.5"
                value={form.phone}
                onChange={(event) => patch("phone", event.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1.5"
                type="email"
                value={form.email}
                onChange={(event) => patch("email", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Business Details</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>GSTIN</Label>
              <Input
                className="mt-1.5"
                value={form.gstin}
                onChange={(event) => patch("gstin", event.target.value)}
              />
              {errors.gstin ? (
                <p className="mt-1 text-xs text-red-600">{errors.gstin}</p>
              ) : null}
            </div>
            <div>
              <Label>PAN</Label>
              <Input
                className="mt-1.5"
                value={form.pan}
                onChange={(event) => patch("pan", event.target.value)}
              />
            </div>
            <div>
              <Label>CIN</Label>
              <Input
                className="mt-1.5"
                value={form.cin}
                onChange={(event) => patch("cin", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Business Address</Label>
              <Textarea
                className="mt-1.5"
                value={form.address}
                onChange={(event) => patch("address", event.target.value)}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                className="mt-1.5"
                value={form.city}
                onChange={(event) => patch("city", event.target.value)}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                className="mt-1.5"
                value={form.state}
                onChange={(event) => patch("state", event.target.value)}
              />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input
                className="mt-1.5"
                value={form.pincode}
                onChange={(event) => patch("pincode", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Commercial Details
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Preferred Commodities</Label>
              <Select
                value={form.commodities[0]}
                onValueChange={(value) =>
                  patch(
                    "commodities",
                    form.commodities.includes(value)
                      ? [value]
                      : [...form.commodities, value],
                  )
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMODITIES.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-slate-500">
                Selected: {form.commodities.join(", ")}
              </p>
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Select
                value={form.paymentTerms}
                onValueChange={(value) => patch("paymentTerms", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minimum Order Quantity (MT)</Label>
              <Input
                className="mt-1.5"
                value={form.moq}
                onChange={(event) => patch("moq", event.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 sm:col-span-2">
              <Label htmlFor="credit-available">Credit Available</Label>
              <Switch
                id="credit-available"
                checked={form.creditAvailable}
                onCheckedChange={(checked) => patch("creditAvailable", checked)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Compliance</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <Label>GST Verification</Label>
              <Select
                value={form.gstStatus}
                onValueChange={(value) => patch("gstStatus", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>KYC status</Label>
              <Select
                value={form.kyc}
                onValueChange={(value) => patch("kyc", value as KycBadge)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Documents status</Label>
              <Select
                value={form.documentsStatus}
                onValueChange={(value) => patch("documentsStatus", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETE">Complete</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    </ActionDrawer>
  );
}
