"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  initialOnboardingState,
  ONBOARDING_STEPS,
  STEP_PROGRESS,
} from "@/lib/constants/onboarding";
import type { OnboardingStore } from "@/types/onboarding";

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialOnboardingState,

      setMobileNumber: (mobile, countryCode = "+91") =>
        set({ mobileNumber: mobile, countryCode }),

      setOtpVerified: (verified) => set({ isOtpVerified: verified }),

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      triggerAutoSave: () => {
        set({ isSaving: true });
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          set({
            isSaving: false,
            lastSavedAt: new Date().toISOString(),
          });
        }, 800);
      },

      updateCompany: (data) => {
        set((state) => ({ company: { ...state.company, ...data } }));
        get().triggerAutoSave();
      },

      updateDocument: (id, data) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...data } : doc,
          ),
        }));
        get().triggerAutoSave();
      },

      updateGst: (data) => {
        set((state) => ({ gst: { ...state.gst, ...data } }));
        get().triggerAutoSave();
      },

      updatePan: (data) => {
        set((state) => ({ pan: { ...state.pan, ...data } }));
        get().triggerAutoSave();
      },

      updateBank: (data) => {
        set((state) => ({ bank: { ...state.bank, ...data } }));
        get().triggerAutoSave();
      },

      updateLocation: (data) => {
        set((state) => ({ location: { ...state.location, ...data } }));
        get().triggerAutoSave();
      },

      updateReview: (data) => {
        set((state) => ({ review: { ...state.review, ...data } }));
        get().triggerAutoSave();
      },

      submitOnboarding: () =>
        set({
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
          currentStep: "submitted",
          completedSteps: ONBOARDING_STEPS.map((s) => s.id),
        }),

      resetOnboarding: () => set(initialOnboardingState),

      getProgress: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep === "submitted") return 100;
        const baseProgress = STEP_PROGRESS[currentStep] ?? 0;
        const completedBonus = completedSteps.length * 2;
        return Math.min(baseProgress + completedBonus, 95);
      },

      isStepAccessible: (step) => {
        const { completedSteps, currentStep } = get();
        const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === step);
        const currentIndex = ONBOARDING_STEPS.findIndex(
          (s) => s.id === currentStep,
        );
        if (stepIndex === -1) return false;
        if (completedSteps.includes(step)) return true;
        if (step === currentStep) return true;
        return stepIndex <= currentIndex;
      },
    }),
    {
      name: "petrotrade-onboarding",
      partialize: (state) => ({
        mobileNumber: state.mobileNumber,
        countryCode: state.countryCode,
        isOtpVerified: state.isOtpVerified,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        lastSavedAt: state.lastSavedAt,
        company: state.company,
        documents: state.documents,
        gst: state.gst,
        pan: state.pan,
        bank: state.bank,
        location: state.location,
        review: state.review,
        isSubmitted: state.isSubmitted,
        submittedAt: state.submittedAt,
      }),
    },
  ),
);
