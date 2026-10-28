import { create } from "zustand";

type SyncState = {
  pendingCount: number;
  isSyncing: boolean;
  version: number;
  setPendingCount: (pendingCount: number) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  incrementVersion: () => void;
};

export const useSyncStore = create<SyncState>()((set) => ({
  pendingCount: 0,
  isSyncing: false,
  version: 0,
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
}));
