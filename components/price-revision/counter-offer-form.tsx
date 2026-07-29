"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import type {
  CounterOfferDraft,
  CounterValidity,
} from "@/types/price-revision";
import { COUNTER_VALIDITY_OPTIONS } from "@/types/price-revision";

const schema = z.object({
  counterPrice: z
    .string()
    .min(1, "Counter price is required")
    .refine((v) => Number(v) > 0, "Must be a positive amount"),
  moq: z
    .string()
    .min(1, "MOQ is required")
    .refine((v) => Number(v) > 0, "Must be a positive amount"),
  validity: z.string().min(1, "Validity is required"),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CounterOfferFormProps {
  formData: CounterOfferDraft;
  disabled?: boolean;
  onChange: (data: Partial<CounterOfferDraft>) => void;
  onSubmit: (data: FormValues) => void;
  onSaveDraft: () => void;
}

export function CounterOfferForm({
  formData,
  disabled,
  onChange,
  onSubmit,
  onSaveDraft,
}: CounterOfferFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      counterPrice: formData.counterPrice,
      moq: formData.moq,
      validity: formData.validity,
      remarks: formData.remarks,
    },
  });

  const validity = watch("validity");

  useEffect(() => {
    setValue("counterPrice", formData.counterPrice);
    setValue("moq", formData.moq);
    setValue("validity", formData.validity);
    setValue("remarks", formData.remarks);
  }, [formData, setValue]);

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(onSubmit)}
      id="counter-offer-form"
    >
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Counter Offer
      </h4>

      <div className="space-y-1.5">
        <Label htmlFor="counterPrice" className="text-xs text-slate-600">
          New Counter Price (₹/MT)
        </Label>
        <Input
          id="counterPrice"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          disabled={disabled}
          {...register("counterPrice", {
            onChange: (e) => onChange({ counterPrice: e.target.value }),
          })}
        />
        {errors.counterPrice ? (
          <p className="text-xs text-red-600">{errors.counterPrice.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="moq" className="text-xs text-slate-600">
            MOQ (MT)
          </Label>
          <Input
            id="moq"
            type="number"
            disabled={disabled}
            {...register("moq", {
              onChange: (e) => onChange({ moq: e.target.value }),
            })}
          />
          {errors.moq ? (
            <p className="text-xs text-red-600">{errors.moq.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Validity</Label>
          <Select
            value={validity}
            disabled={disabled}
            onValueChange={(v) => {
              setValue("validity", v);
              onChange({ validity: v as CounterValidity });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select validity" />
            </SelectTrigger>
            <SelectContent>
              {COUNTER_VALIDITY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.validity ? (
            <p className="text-xs text-red-600">{errors.validity.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="remarks" className="text-xs text-slate-600">
          Remarks / Internal Notes
        </Label>
        <Textarea
          id="remarks"
          rows={3}
          placeholder="Message to PetroTrade admin..."
          disabled={disabled}
          {...register("remarks", {
            onChange: (e) => onChange({ remarks: e.target.value }),
          })}
        />
      </div>

      {!disabled ? (
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            className="flex-1 bg-[#0B1F3A] text-xs font-bold uppercase hover:bg-[#122846]"
          >
            Submit Counter
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs font-bold uppercase"
            onClick={onSaveDraft}
          >
            Save Draft
          </Button>
        </div>
      ) : null}
    </form>
  );
}
