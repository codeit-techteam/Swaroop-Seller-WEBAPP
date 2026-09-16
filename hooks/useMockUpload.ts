"use client";

import { useCallback } from "react";

import { parseGstin } from "@/lib/utils/gst";
import { useOnboardingStore } from "@/store/onboardingStore";

export function useMockUpload() {
  const updateDocument = useOnboardingStore((s) => s.updateDocument);

  const simulateUpload = useCallback(
    (docId: string, file: File, onComplete?: () => void) => {
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      updateDocument(docId, {
        status: "uploading",
        fileName: file.name,
        fileSize: file.size,
        uploadProgress: 0,
        errorMessage: undefined,
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          clearInterval(interval);
          updateDocument(docId, {
            status: "uploaded",
            uploadProgress: 100,
            uploadedAt: new Date().toISOString(),
            previewUrl,
          });
          onComplete?.();
        } else {
          updateDocument(docId, {
            uploadProgress: Math.min(Math.round(progress), 99),
          });
        }
      }, 300);
    },
    [updateDocument],
  );

  const simulateDelete = useCallback(
    (docId: string) => {
      updateDocument(docId, {
        status: "empty",
        fileName: undefined,
        fileSize: undefined,
        uploadProgress: undefined,
        uploadedAt: undefined,
        previewUrl: undefined,
        errorMessage: undefined,
      });
    },
    [updateDocument],
  );

  const simulateCancel = useCallback(
    (docId: string) => {
      updateDocument(docId, {
        status: "empty",
        fileName: undefined,
        fileSize: undefined,
        uploadProgress: undefined,
      });
    },
    [updateDocument],
  );

  return { simulateUpload, simulateDelete, simulateCancel };
}

export function useMockVerification() {
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updatePan = useOnboardingStore((s) => s.updatePan);

  const verifyGst = useCallback(
    (gstNumber: string) =>
      new Promise<void>((resolve) => {
        updateGst({ gstNumber, status: "loading" });
        setTimeout(() => {
          const parsed = parseGstin(gstNumber);
          updateGst({
            gstNumber: parsed.gstNumber,
            status: parsed.isValid ? "verified" : "rejected",
            gstStatus: parsed.isValid ? "ACTIVE" : undefined,
            gstType: parsed.isValid ? "Regular" : undefined,
            stateCode: parsed.stateCode,
            state: parsed.state,
            pan: parsed.pan,
          });
          resolve();
        }, 1500);
      }),
    [updateGst],
  );

  const verifyPan = useCallback(
    (panNumber: string) =>
      new Promise<void>((resolve) => {
        updatePan({ panNumber, status: "loading" });
        setTimeout(() => {
          updatePan({
            panNumber,
            status: "verified",
            holderName: "PetroCorp International Private Limited",
            panStatus: "VALID",
          });
          resolve();
        }, 2000);
      }),
    [updatePan],
  );

  return { verifyGst, verifyPan };
}
