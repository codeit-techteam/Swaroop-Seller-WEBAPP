"use client";

import { Switch } from "@/components/ui/switch";

interface VisibilitySwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function VisibilitySwitch({
  checked,
  onCheckedChange,
  disabled,
}: VisibilitySwitchProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="data-[state=checked]:bg-[#1B6EF3]"
    />
  );
}
