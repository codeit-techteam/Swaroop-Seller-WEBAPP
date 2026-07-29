"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  duration = 1.1,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) => {
    const formatted = latest.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [duration, motionValue, value]);

  return <motion.span className={cn(className)}>{display}</motion.span>;
}
