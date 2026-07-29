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
import { Textarea } from "@/components/ui/textarea";
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
      onChange({ logoFileName: file.name, logoPreview: preview });
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile Details</DialogTitle>
          <DialogDescription>
            Update your company profile information. Changes are saved locally
            and ready for backend sync.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={2}
                value={form.address}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => onChange({ website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Input
                id="warehouse"
                value={form.warehouse}
                onChange={(e) => onChange({ warehouse: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessCategory">Business Category</Label>
              <Input
                id="businessCategory"
                placeholder="Polymers, Industrial Chemicals, Solvents"
                value={form.businessCategory}
                onChange={(e) => onChange({ businessCategory: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => onChange({ description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo Upload</Label>
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center",
              )}
            >
              <input {...getInputProps()} />
              {form.logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoPreview}
                  alt="Logo preview"
                  className="mb-3 h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-slate-400" />
              )}
              <p className="text-sm text-slate-600">
                {form.logoFileName ?? "Drag & drop or browse logo image"}
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
