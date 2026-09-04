"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { useSellerStore } from "@/store/sellerStore";

const schema = z.object({
  category: z.string().min(1),
  description: z.string().min(10, "Please describe the issue"),
});

const faqs = [
  {
    q: "How do I activate all offers?",
    a: "Open My Offers and use Activate All Offers. You will be asked to confirm.",
  },
  {
    q: "Why is buyer identity limited?",
    a: "PetroTrade uses a blind marketplace until the request is accepted or contracted.",
  },
  {
    q: "When are settlements released?",
    a: "After invoice verification. Track status under Settlements.",
  },
];

export function SellerSupportView() {
  const manager = useSellerStore((s) => s.seller.accountManager);
  const [tickets, setTickets] = useState<{ id: string; category: string }[]>(
    [],
  );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { category: "Order", description: "" },
  });

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Support" />
      <section className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Account Manager</h2>
        <p className="mt-2 text-sm">
          {manager.name} · {manager.region}
        </p>
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
      </section>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">FAQs</h2>
        <div className="space-y-3">
          {faqs.map((item) => (
            <div key={item.q}>
              <p className="font-medium">{item.q}</p>
              <p className="text-sm text-slate-500">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Raise Issue</h2>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              setTickets((current) => [
                { id: `t-${Date.now()}`, category: values.category },
                ...current,
              ]);
              toast.success("Support ticket created");
              form.reset();
            })}
          >
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "Order",
                        "Offer",
                        "Payment",
                        "Document",
                        "Technical",
                      ].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <label className="block text-sm">
              Attachment optional
              <Input type="file" className="mt-1" />
            </label>
            <Button type="submit">Submit ticket</Button>
          </form>
        </Form>
        {tickets.length > 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            {tickets.length} ticket(s) created in this session.
          </p>
        ) : null}
      </section>
    </PageContainer>
  );
}
