import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { resetSendingToPending } from "@/db/readings";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncPending } from "@/services/sync";
import { useSyncStore } from "@/store/sync";

export default function SyncManager() {
  const db = useSQLiteContext();
  const { isOnline } = useNetworkStatus();
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const isReady = useRef(false);
  const previousOnline = useRef(isOnline);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === "active"
  );

  const retrySync = useCallback(() => {
    void syncPending(db).catch((error: unknown) => {
      console.error("No se pudo reintentar la sincronización.", error);
    });
  }, [db]);

  useEffect(() => {
    let isMounted = true;

    void resetSendingToPending(db)
      .then(() => {
        if (!isMounted) {
          return;
        }

        isReady.current = true;
        return syncPending(db);
      })
      .catch((error: unknown) => {
        console.error("No se pudo iniciar la sincronización.", error);
      });

    return () => {
      isMounted = false;
      isReady.current = false;
    };
  }, [db]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setIsAppActive(state === "active");
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const reconnected = !previousOnline.current && isOnline;
    previousOnline.current = isOnline;

    if (isReady.current && reconnected) {
      retrySync();
    }
  }, [isOnline, retrySync]);

  useEffect(() => {
    if (isReady.current && isAppActive) {
      retrySync();
    }
  }, [isAppActive, retrySync]);

  useEffect(() => {
    if (!isReady.current || !isAppActive || pendingCount === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      retrySync();
    }, 30_000);

    return () => clearTimeout(timeout);
  }, [isAppActive, pendingCount, retrySync]);

  return null;
}
