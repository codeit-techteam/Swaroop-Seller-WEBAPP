"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { RequestReportForm } from "@/types/performance";

const reportSchema = z.object({
  reportType: z.string().min(1, "Report type is required"),
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
  email: z.string().email("Enter a valid email address"),
  remarks: z.string().optional(),
});

interface RequestReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: RequestReportForm) => void;
  defaultDateFrom?: string;
  defaultDateTo?: string;
}

export function RequestReportModal({
  open,
  onOpenChange,
  onSubmit,
  defaultDateFrom = "",
  defaultDateTo = "",
}: RequestReportModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: "",
      dateFrom: defaultDateFrom,
      dateTo: defaultDateTo,
      email: "",
      remarks: "",
    },
  });

  const reportType = watch("reportType");

  const onFormSubmit = (data: RequestReportForm) => {
    onSubmit(data);
    toast.success("Custom report request submitted successfully");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Request Custom Report</DialogTitle>
          <DialogDescription>
            Submit a request for a tailored performance or compliance report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(v) => setValue("reportType", v)}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance Summary</SelectItem>
                <SelectItem value="compliance">Compliance Audit</SelectItem>
                <SelectItem value="settlement">Settlement Analysis</SelectItem>
                <SelectItem value="inventory">Inventory Health</SelectItem>
              </SelectContent>
            </Select>
            {errors.reportType ? (
              <p className="text-xs text-red-500">
                {errors.reportType.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input id="dateFrom" type="date" {...register("dateFrom")} />
              {errors.dateFrom ? (
                <p className="text-xs text-red-500">
                  {errors.dateFrom.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input id="dateTo" type="date" {...register("dateTo")} />
              {errors.dateTo ? (
                <p className="text-xs text-red-500">{errors.dateTo.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="reports@company.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Any specific requirements or notes..."
              rows={3}
              {...register("remarks")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0B1F3A] hover:bg-[#122846]"
              disabled={isSubmitting}
            >
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
