"use client";

import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { SellerStatusBadge } from "@/components/status/seller-status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { maskAccountNumber } from "@/lib/mock/locations";
import { formatMt } from "@/lib/seller/format";
import { useLocationStore } from "@/store/locationStore";
import { useSellerStore } from "@/store/sellerStore";

export function SellerProfileView() {
  const seller = useSellerStore((s) => s.seller);
  const locations = useLocationStore((s) => s.locations);
  const toggleLocationStatus = useLocationStore((s) => s.toggleLocationStatus);
  const setSelectedLocation = useLocationStore((s) => s.setSelectedLocation);
  const bank = seller.bankAccounts[0];
  const manager = seller.accountManager;

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="My Profile"
        description="Company, locations, bank and account manager details"
        actions={<SellerStatusBadge status={seller.verificationStatus} />}
      />

      <Section title="Company Details">
        <Grid
          rows={[
            ["Company", seller.companyName],
            ["Legal name", seller.legalName],
            ["Payment terms", seller.paymentTerms],
            ["Offer validity", `${seller.offerValidityHours} hours`],
            ["Volume sold last month", formatMt(seller.volumeSoldLastMonthMt)],
            ["GST", seller.gst],
            ["PAN", seller.pan],
            ["Contact", seller.contactPerson],
          ]}
        />
        <Button className="mt-3" variant="outline" asChild>
          <Link href={ROUTES.PROFILE_COMPANY}>Edit company details</Link>
        </Button>
      </Section>

      <Section title="Account Manager Details">
        <Grid
          rows={[
            ["Name", manager.name],
            ["Mobile", manager.mobile],
            ["Email", manager.email],
            ["Region", manager.region],
          ]}
        />
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline">
            <a href={`tel:+91${manager.mobile}`}>
              <Phone className="mr-1 h-4 w-4" /> Call
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${manager.email}`}>
              <Mail className="mr-1 h-4 w-4" /> Email
            </a>
          </Button>
        </div>
      </Section>

      <Section title="Locations & Decision Makers">
        <div className="space-y-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex flex-col justify-between gap-3 rounded-lg border p-3 md:flex-row md:items-center"
            >
              <div>
                <p className="font-medium">
                  {location.name} · {location.decisionMaker}
                </p>
                <p className="text-xs text-slate-500">{location.warehouse}</p>
              </div>
              <div className="flex items-center gap-2">
                <SellerStatusBadge status={location.status} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLocation(location.id)}
                >
                  Switch
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleLocationStatus(location.id);
                    toast.success("Profile updated.");
                  }}
                >
                  {location.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Bank Details">
        {bank ? (
          <Grid
            rows={[
              ["GST", seller.gst],
              ["Bank name", bank.bankName],
              ["Account number", maskAccountNumber(bank.accountNumber)],
              ["IFSC", bank.ifsc],
              ["Email for PO", bank.poEmail],
            ]}
          />
        ) : null}
      </Section>

      <Section title="Business Information">
        <Grid
          rows={[
            ["Seller type", seller.sellerType],
            ["Years in business", seller.yearsInBusiness],
            ["Categories", seller.primaryCategories.join(", ")],
            ["Monthly capacity", formatMt(seller.monthlyTradingCapacityMt)],
          ]}
        />
      </Section>
    </PageContainer>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 border-b pb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase text-slate-500">{label}</dt>
          <dd className="mt-0.5 font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
