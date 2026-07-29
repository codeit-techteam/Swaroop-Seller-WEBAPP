"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
  control?: Control<T>;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  description,
  type = "text",
  control,
}: FormInputProps<T>) {
  const formContext = useFormContext<T>();
  const formControl = control ?? formContext.control;

  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface FormTextareaProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  control?: Control<T>;
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  description,
  control,
}: FormTextareaProps<T>) {
  const formContext = useFormContext<T>();
  const formControl = control ?? formContext.control;

  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea placeholder={placeholder} {...field} />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
