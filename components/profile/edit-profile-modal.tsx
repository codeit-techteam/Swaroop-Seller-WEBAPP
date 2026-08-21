"use client";

import { Loader2, Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

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
import { cn } from "@/lib/utils";
import type { EditProfileForm } from "@/types/profile";

interface EditProfileModalProps {
  open: boolean;
  form: EditProfileForm;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (data: Partial<EditProfileForm>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditProfileModal({
  open,
  form,
  isSaving,
  onOpenChange,
  onChange,
  onSave,
  onCancel,
}: EditProfileModalProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      onChange({ avatarFileName: file.name, avatarPreview: preview });
    },
    [onChange],
  );

  const {
    getRootProps,
    getInputProps,
    open: openPicker,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Admin Profile</DialogTitle>
          <DialogDescription>
            Update your contact details and office information for the ADMIN
            PANEL.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => onChange({ name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => onChange({ email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => onChange({ department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeLocation">Office Location</Label>
              <Input
                id="officeLocation"
                value={form.officeLocation}
                onChange={(e) => onChange({ officeLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center",
              )}
            >
              <input {...getInputProps()} />
              {form.avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.avatarPreview}
                  alt="Avatar preview"
                  className="mb-3 h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-slate-400" />
              )}
              <p className="text-sm text-slate-600">
                {form.avatarFileName ?? "Drag & drop or browse a photo"}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={openPicker}
              >
                Browse Files
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0B1F3A] hover:bg-[#122846]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
