"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchSellerIdentityStatus,
  fetchSellerOnboardingIdentity,
  type KycVerificationResult,
  type SellerIdentityStatus,
  type SellerOnboardingIdentity,
  toStoreStatus,
} from "@/services/seller-kyc-verification";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { VerificationStatus } from "@/types/onboarding";

function savedStatus(value: string | null): VerificationStatus | null {
  if (value === "verified") return "verified";
  if (value === "manual_review") return "pending";
  return null;
}

type LoadedIdentity = {
  status: SellerIdentityStatus | null;
  saved: SellerOnboardingIdentity | null;
};

async function loadIdentity(): Promise<LoadedIdentity | null> {
  try {
    const [status, saved] = await Promise.all([
      fetchSellerIdentityStatus(),
      fetchSellerOnboardingIdentity(),
    ]);
    return { status, saved };
  } catch {
    return null;
  }
}

/**
 * PAN / GSTIN verification state for seller onboarding. The backend is the
 * source of truth: local state is reconciled with it on mount and after each
 * verification, so Seller Web and Seller App always show the same result.
 */
export function useSellerIdentityVerification() {
  const updateGst = useOnboardingStore((s) => s.updateGst);
  const updatePan = useOnboardingStore((s) => s.updatePan);
  const updateCompany = useOnboardingStore((s) => s.updateCompany);
  const updateLocation = useOnboardingStore((s) => s.updateLocation);
  const [identity, setIdentity] = useState<SellerIdentityStatus | null>(null);

  const reconcile = useCallback(
    (loaded: LoadedIdentity) => {
      const { status, saved } = loaded;
      setIdentity(status);
      const { gst, pan } = useOnboardingStore.getState();

      const gstState = savedStatus(saved?.gstStatus ?? null);
      if (saved?.gstin && gstState) {
        const details = status?.verifications.gst?.details;
        updateGst({
          gstNumber: saved.gstin,
          status: gstState,
          details,
          message: status?.verifications.gst?.message,
          companyName: details?.legalName ?? undefined,
          state: details?.state ?? undefined,
          stateCode: details?.stateCode ?? undefined,
        });
        updateCompany({ gstNumber: saved.gstin });
        if (details?.state) updateLocation({ state: details.state });
      } else if (gst.status === "verified" || gst.status === "pending") {
        updateGst({ status: "idle", details: undefined, message: undefined });
      }

      const panState = savedStatus(saved?.panStatus ?? null);
      if (saved?.pan && panState) {
        const details = status?.verifications.pan?.details;
        updatePan({
          panNumber: saved.pan,
          status: panState,
          details,
          message: status?.verifications.pan?.message,
          holderName: details?.nameOnPan ?? undefined,
        });
        updateCompany({ panNumber: saved.pan });
      } else if (pan.status === "verified" || pan.status === "pending") {
        updatePan({ status: "idle", details: undefined, message: undefined });
      }
    },
    [updateCompany, updateGst, updateLocation, updatePan],
  );

  const refresh = useCallback(async () => {
    const loaded = await loadIdentity();
    if (loaded) reconcile(loaded);
  }, [reconcile]);

  useEffect(() => {
    let active = true;
    void loadIdentity().then((loaded) => {
      if (active && loaded) reconcile(loaded);
    });
    return () => {
      active = false;
    };
  }, [reconcile]);

  const applyGstResult = useCallback(
    (result: KycVerificationResult, gstin: string) => {
      const details = result.details;
      updateGst({
        gstNumber: gstin,
        status: toStoreStatus(result.status),
        details,
        message: result.message,
        companyName: details.legalName ?? undefined,
        gstStatus: details.gstStatus ?? undefined,
        state: details.state ?? undefined,
        stateCode: details.stateCode ?? undefined,
      });
      updateCompany({ gstNumber: gstin });
      if (details.state) updateLocation({ state: details.state });
      void refresh();
    },
    [refresh, updateCompany, updateGst, updateLocation],
  );

  const applyPanResult = useCallback(
    (result: KycVerificationResult, panNumber: string) => {
      updatePan({
        panNumber,
        status: toStoreStatus(result.status),
        details: result.details,
        message: result.message,
        holderName: result.details.nameOnPan ?? undefined,
      });
      updateCompany({ panNumber });
      void refresh();
    },
    [refresh, updateCompany, updatePan],
  );

  const editGst = useCallback(() => {
    updateGst({ status: "idle", details: undefined, message: undefined });
  }, [updateGst]);

  const editPan = useCallback(() => {
    updatePan({ status: "idle", details: undefined, message: undefined });
  }, [updatePan]);

  return {
    locked: identity?.locked ?? false,
    mismatch: identity?.verifications.mismatch ?? false,
    blockers: identity?.verificationBlockers ?? [],
    applyGstResult,
    applyPanResult,
    editGst,
    editPan,
    refresh,
  };
}
