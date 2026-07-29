"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
}

export function ImagePreview({
  open,
  onOpenChange,
  src,
  alt,
}: ImagePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-4">
          <DialogTitle>{alt}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full rounded-lg object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
