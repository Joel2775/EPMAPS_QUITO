import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { deletePhoto } from "@/services/photos";
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
  clientId: string | null;
  editingClientId: string | null;
  photoUri: string | null;
  hasHydrated: boolean;
  startDraft: (meterCode: string, meter: MeterDTO | null) => void;
  startEditDraft: (row: {
    clientId: string;
    meterCode: string;
    condition: ReadingCondition;
    readingValue: number | null;
    reasonOrDamage: string | null;
    anomalyConfirmed: boolean;
    photoUri: string | null;
    previousReading: number | null;
    averageMonthly: number | null;
  }) => void;
  setStep: (step: number) => void;
  setCondition: (condition: ReadingCondition) => void;
  setReadingData: (data: ReadingData) => void;
  setPhotoUri: (uri: string | null) => void;
  clearDraft: () => void;
};

export const selectHasDraft = (state: DraftState) =>
  state.meterCode !== null;

const emptyDraft = {
  step: 0,
  meterCode: null,
  meter: null,
  condition: null,
  readingText: "",
  reasonOrDamage: "",
  anomalyConfirmed: false,
  clientId: null,
  editingClientId: null,
  photoUri: null,
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...emptyDraft,
      hasHydrated: false,
      startDraft: (meterCode, meter) => {
        const randomSuffix = Math.random().toString(36).slice(2, 8);

        set({
          ...emptyDraft,
          step: 1,
          meterCode,
          meter,
          clientId: `${Date.now()}-${randomSuffix}`,
          editingClientId: null,
        });
      },
      startEditDraft: (row) => {
        const meter: MeterDTO | null =
          row.previousReading !== null
            ? {
                id: row.meterCode,
                code: row.meterCode,
                accountNumber: "",
                address: "",
                sector: "",
                condition: "",
                lastReading: row.previousReading,
                lastReadingDate: "",
                averageMonthlyConsumption: row.averageMonthly ?? 0,
              }
            : null;

        set({
          ...emptyDraft,
          step: 1,
          meterCode: row.meterCode,
          meter,
          condition: row.condition,
          readingText: row.readingValue !== null ? String(row.readingValue) : "",
          reasonOrDamage: row.reasonOrDamage ?? "",
          anomalyConfirmed: row.anomalyConfirmed,
          clientId: row.clientId,
          editingClientId: row.clientId,
          photoUri: row.photoUri,
        });
      },
      setStep: (step) => set({ step }),
      setCondition: (condition) =>
        set({
          condition,
          ...(condition === "inaccesible" ? { readingText: "" } : {}),
        }),
      setReadingData: (data) => set(data),
      setPhotoUri: (uri) =>
        set((state) => {
          if (state.editingClientId !== null) {
            return { photoUri: uri ?? state.photoUri };
          }

          const previousUri = state.photoUri;

          if (previousUri && previousUri !== uri) {
            void deletePhoto(previousUri);
          }

          return { photoUri: uri };
        }),
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
        clientId: state.clientId,
        editingClientId: state.editingClientId,
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
