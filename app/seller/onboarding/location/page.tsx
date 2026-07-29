"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { FormInput, FormTextarea } from "@/components/forms/form-fields";
import { FormWrapper } from "@/components/forms/form-wrapper";
import {
  FooterNavigation,
  FormSelect,
  MapPlaceholder,
  ProgressHeader,
} from "@/components/onboarding";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import {
  type LocationFormValues,
  locationSchema,
} from "@/lib/schemas/onboarding";
import {
  indianStates,
  mockLocationData,
} from "@/mock/onboarding/onboardingMock";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function LocationPage() {
  const router = useRouter();
  const location = useOnboardingStore((s) => s.location);
  const gst = useOnboardingStore((s) => s.gst);
  const updateLocation = useOnboardingStore((s) => s.updateLocation);
  const markStepComplete = useOnboardingStore((s) => s.markStepComplete);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setCurrentStep("location");
  }, [setCurrentStep]);

  const defaultValues: LocationFormValues = {
    warehouseAddress: location.warehouseAddress,
    city: location.city,
    state: location.state,
    pincode: location.pincode,
    registeredAddress:
      location.registeredAddress || gst.registeredAddress || "",
  };

  const createUploadHandler = useCallback(
    (field: "warehousePhoto" | "entrancePhoto") => (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      if (field === "warehousePhoto") {
        updateLocation({
          warehousePhotoFileName: file.name,
          warehousePhotoPreview: preview,
        });
      } else {
        updateLocation({
          entrancePhotoFileName: file.name,
          entrancePhotoPreview: preview,
        });
      }
      toast.success(
        `${field === "warehousePhoto" ? "Warehouse" : "Entrance"} photo uploaded`,
      );
    },
    [updateLocation],
  );

  const warehouseDropzone = useDropzone({
    onDrop: createUploadHandler("warehousePhoto"),
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const entranceDropzone = useDropzone({
    onDrop: createUploadHandler("entrancePhoto"),
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    await new Promise((r) => setTimeout(r, 1200));
    updateLocation({
      latitude: mockLocationData.latitude,
      longitude: mockLocationData.longitude,
      locationLabel: mockLocationData.locationLabel,
      locationVerified: true,
    });
    setIsLocating(false);
    toast.success("Location verified successfully");
  };

  const onSubmit = (values: LocationFormValues) => {
    if (!location.warehousePhotoFileName || !location.entrancePhotoFileName) {
      toast.error("Please upload warehouse and entrance photos");
      return;
    }
    if (!location.locationVerified) {
      toast.error("Please verify your location on the map");
      return;
    }
    updateLocation(values);
    markStepComplete("location");
    setCurrentStep("review");
    router.push(ROUTES.ONBOARDING_REVIEW);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl pb-24"
    >
      <ProgressHeader
        stepId="location"
        title="Location Verification"
        description="Step 5 of 5: Verify your business operating location for compliance and logistics."
      />

      <FormWrapper
        schema={locationSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <section className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Business Address</h3>
            <Badge variant="destructive" className="text-xs">
              REQUIRED FIELD
            </Badge>
          </div>
          <div className="grid gap-4">
            <FormTextarea<LocationFormValues>
              name="registeredAddress"
              label="Registered Address"
              placeholder="Enter registered business address"
            />
            <FormTextarea<LocationFormValues>
              name="warehouseAddress"
              label="Warehouse Address"
              placeholder="Enter warehouse / operating address"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput<LocationFormValues>
                name="city"
                label="City"
                placeholder="City"
              />
              <FormSelect<LocationFormValues>
                name="state"
                label="State"
                options={indianStates}
              />
              <FormInput<LocationFormValues>
                name="pincode"
                label="Pincode"
                placeholder="6-digit pincode"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold">Site Documentation</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div
              {...warehouseDropzone.getRootProps()}
              className="cursor-pointer rounded-lg border-2 border-dashed p-6 hover:border-primary/50 hover:bg-muted/30"
            >
              <input {...warehouseDropzone.getInputProps()} />
              {location.warehousePhotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={location.warehousePhotoPreview}
                  alt="Warehouse"
                  className="mb-3 h-32 w-full rounded object-cover"
                />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              )}
              <p className="font-medium">Warehouse Photo</p>
              <p className="text-xs text-muted-foreground">
                Main storage area interior
              </p>
              {location.warehousePhotoFileName ? (
                <p className="mt-2 text-xs text-success">
                  {location.warehousePhotoFileName}
                </p>
              ) : null}
            </div>

            <div
              {...entranceDropzone.getRootProps()}
              className="cursor-pointer rounded-lg border-2 border-dashed p-6 hover:border-primary/50 hover:bg-muted/30"
            >
              <input {...entranceDropzone.getInputProps()} />
              {location.entrancePhotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={location.entrancePhotoPreview}
                  alt="Entrance"
                  className="mb-3 h-32 w-full rounded object-cover"
                />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              )}
              <p className="font-medium">Facility Entrance Photo</p>
              <p className="text-xs text-muted-foreground">
                Building entrance with signage visible
              </p>
              {location.entrancePhotoFileName ? (
                <p className="mt-2 text-xs text-success">
                  {location.entrancePhotoFileName}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-lg font-semibold">
            Precise Location Mapping
          </h3>
          <MapPlaceholder
            latitude={location.latitude ?? mockLocationData.latitude}
            longitude={location.longitude ?? mockLocationData.longitude}
            locationLabel={location.locationLabel ?? "Select location on map"}
            isVerified={location.locationVerified}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLoading={isLocating}
          />
        </section>

        <FooterNavigation
          onPrevious={() => router.push(ROUTES.ONBOARDING_BANK)}
          previousLabel="Back to Banking"
          continueLabel="Continue to Final Review"
          continueType="submit"
        />
      </FormWrapper>
    </motion.div>
  );
}
