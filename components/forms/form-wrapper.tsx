"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

interface FormWrapperProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (values: T) => void;
  children: React.ReactNode;
  className?: string;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormWrapperProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
