import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { TECHNICIANS } from "@/constants/tecnicos";

type SessionState = {
  employeeCode: string | null;
  hasHydrated: boolean;
  login: (code: string, password: string) => boolean;
  logout: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      employeeCode: null,
      hasHydrated: false,
      login: (code, password) => {
        const technician = TECHNICIANS.find(
          (item) => item.code === code && item.password === password
        );

        if (!technician) {
          return false;
        }

        set({ employeeCode: technician.code });
        return true;
      },
      logout: () => set({ employeeCode: null }),
    }),
    {
      name: "session",
      storage: createJSONStorage(() => Storage),
      partialize: (state) => ({ employeeCode: state.employeeCode }),
    }
  )
);

const markHydrated = () => {
  if (!useSessionStore.getState().hasHydrated) {
    useSessionStore.setState({ hasHydrated: true });
  }
};

if (useSessionStore.persist.hasHydrated()) {
  markHydrated();
} else {
  useSessionStore.persist.onFinishHydration(markHydrated);
}
