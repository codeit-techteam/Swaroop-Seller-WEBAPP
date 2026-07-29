"use client";

import { FileText, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/formatDate";

interface FileCardProps {
  name: string;
  type: string;
  uploadedAt: string;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function FileCard({
  name,
  type,
  uploadedAt,
  onView,
  onDownload,
  className,
}: FileCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border bg-card p-4 shadow-soft",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {type} · {formatDate(uploadedAt)}
          </p>
        </div>
      </div>
      <ActionMenu
        items={[
          ...(onView ? [{ label: "View", onClick: onView }] : []),
          ...(onDownload ? [{ label: "Download", onClick: onDownload }] : []),
        ]}
      />
    </div>
  );
}

interface ActionMenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.onClick}
            className={
              item.destructive
                ? "text-destructive focus:text-destructive"
                : undefined
            }
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
