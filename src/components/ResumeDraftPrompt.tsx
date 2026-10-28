import { useEffect } from "react";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";

import { discardDraft } from "@/services/drafts";
import { selectHasDraft, useDraftStore } from "@/store/draft";

let checkedDraftOnAppOpen = false;

export default function ResumeDraftPrompt() {
  const db = useSQLiteContext();
  const router = useRouter();
  const hasHydrated = useDraftStore((state) => state.hasHydrated);
  const hasDraft = useDraftStore(selectHasDraft);

  useEffect(() => {
    if (!hasHydrated || checkedDraftOnAppOpen) {
      return;
    }

    checkedDraftOnAppOpen = true;

    if (!hasDraft) {
      return;
    }

    const { meterCode, step } = useDraftStore.getState();

    Alert.alert(
      "Registro sin terminar",
      `El registro del medidor ${meterCode} quedó en el paso ${step}.`,
      [
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmar descarte",
              "¿Deseas descartar este registro? También se eliminará su foto.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Descartar",
                  style: "destructive",
                  onPress: () => {
                    void discardDraft(db).catch((error: unknown) => {
                      Alert.alert(
                        "No se pudo descartar",
                        error instanceof Error
                          ? error.message
                          : "Intenta de nuevo."
                      );
                    });
                  },
                },
              ],
              { cancelable: false }
            );
          },
        },
        {
          text: "Continuar",
          onPress: () => {
            const stepToResume = useDraftStore.getState().step;

            router.push("/lectura/paso-1");
            if (stepToResume >= 2) {
              router.push("/lectura/paso-2");
            }
            if (stepToResume >= 3) {
              router.push("/lectura/paso-3");
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, [db, hasDraft, hasHydrated, router]);

  return null;
}
