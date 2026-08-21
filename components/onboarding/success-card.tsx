"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SuccessCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function SuccessCard({
  title,
  description,
  children,
  className,
}: SuccessCardProps) {
  return (
    <Card className={cn("overflow-hidden shadow-elevated", className)}>
      <CardContent className="p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10"
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2 text-muted-foreground">{description}</p>
          {children}
        </motion.div>
      </CardContent>
    </Card>
  );
}

interface SubmissionSummaryItemProps {
  label: string;
  value: string;
}

export function SubmissionSummaryItem({
  label,
  value,
}: SubmissionSummaryItemProps) {
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

interface EstimatedReviewBannerProps {
  hours: string;
  className?: string;
}

export function EstimatedReviewBanner({
  hours,
  className,
}: EstimatedReviewBannerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-t-4 border-warning bg-sidebar p-5 text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 text-warning" />
        <div>
          <p className="font-semibold">Estimated Review Time</p>
          <p className="mt-1 text-sm text-sidebar-foreground/70">
            Your application will be reviewed within{" "}
            <strong className="text-white">{hours}</strong> after submission.
          </p>
        </div>
      </div>
    </div>
  );
}

interface LockedDashboardButtonProps {
  onClick?: () => void;
  locked?: boolean;
  label?: string;
}

export function LockedDashboardButton({
  onClick,
  locked = true,
  label,
}: LockedDashboardButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onClick}
      type="button"
      disabled={locked}
      title={
        locked
          ? "Dashboard will be available after KYC approval"
          : "Go to dashboard"
      }
    >
      {label ??
        (locked ? "Back To Dashboard (Locked)" : "Back To Dashboard")}
    </Button>
  );
}
