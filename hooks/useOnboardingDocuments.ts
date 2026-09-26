"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { ensureSellerOnboardingDraft } from "@/services/onboarding";
import {
  applyStoredDocument,
  confirmOnboardingDocument,
  createOnboardingDocumentUpload,
  deleteOnboardingDocument,
  downloadOnboardingDocument,
  emptyOnboardingDocumentPatch,
  listOnboardingDocuments,
  onboardingApiError,
  type OnboardingDocumentSlotCode,
  putFileToSignedUrl,
} from "@/services/onboarding-documents";
import { useOnboardingStore } from "@/store/onboardingStore";

const SLOT_IDS = new Set<OnboardingDocumentSlotCode>([
  "gst",
  "pan",
  "aadhaar",
  "cancelledCheque",
]);

function asSlot(id: string): OnboardingDocumentSlotCode | null {
  return SLOT_IDS.has(id as OnboardingDocumentSlotCode)
    ? (id as OnboardingDocumentSlotCode)
    : null;
}

export function useOnboardingDocuments() {
  const updateDocument = useOnboardingStore((s) => s.updateDocument);
  const [syncing, setSyncing] = useState(true);
  const abortRef = useRef<Map<string, () => void>>(new Map());
  const pendingIdRef = useRef<Map<string, string>>(new Map());

  const sync = useCallback(async () => {
    await ensureSellerOnboardingDraft(useOnboardingStore.getState());
    const slots = await listOnboardingDocuments();
    const state = useOnboardingStore.getState();
    for (const slot of slots) {
      const current = state.documents.find((doc) => doc.id === slot.slot);
      if (current?.status === "uploading") continue;
      if (slot.document?.r2Confirmed) {
        updateDocument(slot.slot, applyStoredDocument(slot.document));
      } else if (current?.storageDocumentId) {
        updateDocument(slot.slot, emptyOnboardingDocumentPatch());
      }
    }
  }, [updateDocument]);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setSyncing(true);
      void sync()
        .catch((error) => {
          if (cancelled) return;
          toast.error(
            onboardingApiError(
              error,
              "Could not load stored onboarding documents",
            ),
          );
        })
        .finally(() => {
          if (!cancelled) setSyncing(false);
        });
    };

    const unsub = useOnboardingStore.persist.onFinishHydration(run);
    if (useOnboardingStore.persist.hasHydrated()) run();
    return () => {
      cancelled = true;
      unsub();
    };
  }, [sync]);

  const upload = useCallback(
    async (slotId: string, file: File) => {
      const slot = asSlot(slotId);
      if (!slot) return;

      abortRef.current.get(slot)?.();
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      updateDocument(slot, {
        status: "uploading",
        fileName: file.name,
        fileSize: file.size,
        uploadProgress: 8,
        errorMessage: undefined,
        previewUrl,
        storageDocumentId: undefined,
      });

      let createdId: string | undefined;
      try {
        const created = await createOnboardingDocumentUpload({ slot, file });
        createdId = created.id;
        pendingIdRef.current.set(slot, created.id);
        updateDocument(slot, { uploadProgress: 15 });

        const transfer = putFileToSignedUrl(
          created.uploadUrl,
          file,
          created.mimeType,
          (percent) => {
            updateDocument(slot, {
              uploadProgress: 15 + Math.round(percent * 0.75),
            });
          },
        );
        abortRef.current.set(slot, transfer.abort);
        await transfer.promise;

        updateDocument(slot, { uploadProgress: 94 });
        const confirmed = await confirmOnboardingDocument(created.id);
        pendingIdRef.current.delete(slot);
        updateDocument(slot, {
          ...applyStoredDocument(confirmed),
          previewUrl,
          uploadProgress: 100,
        });
        toast.success(`${file.name} stored`);
      } catch (error) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (error instanceof Error && error.message === "UPLOAD_CANCELLED") {
          updateDocument(slot, emptyOnboardingDocumentPatch());
        } else {
          toast.error(onboardingApiError(error, "Document upload failed"));
          updateDocument(slot, {
            ...emptyOnboardingDocumentPatch(),
            status: "rejected",
            fileName: file.name,
            errorMessage: onboardingApiError(error, "Document upload failed"),
          });
        }
        if (createdId) {
          await deleteOnboardingDocument(createdId).catch(() => undefined);
        }
        await sync().catch(() => undefined);
      } finally {
        abortRef.current.delete(slot);
        pendingIdRef.current.delete(slot);
      }
    },
    [sync, updateDocument],
  );

  const remove = useCallback(
    async (slotId: string) => {
      const slot = asSlot(slotId);
      if (!slot) return;
      const current = useOnboardingStore
        .getState()
        .documents.find((doc) => doc.id === slot);
      const remoteId = current?.storageDocumentId;
      updateDocument(slot, emptyOnboardingDocumentPatch());
      if (!remoteId) return;
      try {
        await deleteOnboardingDocument(remoteId);
      } catch (error) {
        toast.error(
          onboardingApiError(error, "Could not remove the stored document"),
        );
        void sync().catch(() => undefined);
      }
    },
    [sync, updateDocument],
  );

  const cancel = useCallback((slotId: string) => {
    abortRef.current.get(slotId)?.();
    const pendingId = pendingIdRef.current.get(slotId);
    if (pendingId) {
      void deleteOnboardingDocument(pendingId).catch(() => undefined);
    }
  }, []);

  const preview = useCallback(async (slotId: string) => {
    const current = useOnboardingStore
      .getState()
      .documents.find((doc) => doc.id === slotId);
    if (current?.previewUrl) {
      window.open(current.previewUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!current?.storageDocumentId) return;
    try {
      const file = await downloadOnboardingDocument(current.storageDocumentId);
      window.open(file.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(onboardingApiError(error, "Could not open the stored file"));
    }
  }, []);

  return { syncing, upload, remove, cancel, preview };
}
