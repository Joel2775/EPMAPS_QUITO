import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { MeterDTO, ReadingCondition } from "@/types";

type ReadingData = {
  readingText: string;
  reasonOrDamage: string;
  anomalyConfirmed: boolean;
};

type DraftState = {
  step: number;
  meterCode: string | null;
  meter: MeterDTO | null;
  condition: ReadingCondition | null;
  readingText: string;
  reasonOrDamage: string;
  anomalyConfirmed: boolean;
  photoUri: string | null;
  hasHydrated: boolean;
  startDraft: (meter: MeterDTO) => void;
  setStep: (step: number) => void;
  setCondition: (condition: ReadingCondition) => void;
  setReadingData: (data: ReadingData) => void;
  clearDraft: () => void;
};

const emptyDraft = {
  step: 0,
  meterCode: null,
  meter: null,
  condition: null,
  readingText: "",
  reasonOrDamage: "",
  anomalyConfirmed: false,
  photoUri: null,
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...emptyDraft,
      hasHydrated: false,
      startDraft: (meter) =>
        set({
          ...emptyDraft,
          step: 1,
          meterCode: meter.code,
          meter,
        }),
      setStep: (step) => set({ step }),
      setCondition: (condition) =>
        set({
          condition,
          ...(condition === "inaccesible" ? { readingText: "" } : {}),
        }),
      setReadingData: (data) => set(data),
      clearDraft: () =>
        set((state) => ({ ...emptyDraft, hasHydrated: state.hasHydrated })),
    }),
    {
      name: "reading-draft",
      storage: createJSONStorage(() => Storage),
      partialize: (state) => ({
        step: state.step,
        meterCode: state.meterCode,
        meter: state.meter,
        condition: state.condition,
        readingText: state.readingText,
        reasonOrDamage: state.reasonOrDamage,
        anomalyConfirmed: state.anomalyConfirmed,
        photoUri: state.photoUri,
      }),
    }
  )
);

const markHydrated = () => {
  if (!useDraftStore.getState().hasHydrated) {
    useDraftStore.setState({ hasHydrated: true });
  }
};

if (useDraftStore.persist.hasHydrated()) {
  markHydrated();
} else {
  useDraftStore.persist.onFinishHydration(markHydrated);
}
