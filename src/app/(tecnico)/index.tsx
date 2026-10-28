import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { listReadings } from "@/db/readings";
import { useSessionStore } from "@/store/session";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";
import type { ReadingRow } from "@/types";

export default function TechnicianHomeScreen() {
  const employeeCode = useSessionStore((state) => state.employeeCode);
  const logout = useSessionStore((state) => state.logout);
  const db = useSQLiteContext();
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoadError(null);

      void listReadings(db)
        .then((rows) => {
          if (isActive) {
            setReadings(rows);
          }
        })
        .catch((caught: unknown) => {
          if (isActive) {
            setLoadError(
              `No se pudieron cargar las lecturas: ${
                caught instanceof Error
                  ? caught.message
                  : "error desconocido"
              }`
            );
          }
        });

      return () => {
        isActive = false;
      };
    }, [db])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Base lista</Text>
      <Text style={styles.employee}>Técnico: {employeeCode}</Text>
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      {!loadError && readings.length === 0 ? (
        <Text style={styles.emptyState}>Aún no hay lecturas guardadas.</Text>
      ) : null}

      {readings.map((reading) => (
        <View key={reading.clientId} style={styles.readingCard}>
          <View style={styles.readingDetails}>
            <Text style={styles.readingTitle}>{reading.meterCode}</Text>
            <Text style={styles.detail}>Mes: {reading.monthYear}</Text>
            <Text style={styles.detail}>Estado: {reading.condition}</Text>
            <Text style={styles.detail}>
              Consumo: {reading.consumption ?? "—"}
            </Text>
            {reading.syncStatus === "sent" ? (
              <Text style={styles.status}>Enviada</Text>
            ) : (
              <Text style={styles.status}>Pendiente de envío</Text>
            )}
            {reading.verification === "pending_verification" ? (
              <Text style={styles.status}>Pendiente de verificar</Text>
            ) : null}
          </View>
          {reading.photoUri ? (
            <Image
              source={{ uri: reading.photoUri }}
              style={styles.thumbnail}
              accessibilityLabel={`Foto del medidor ${reading.meterCode}`}
            />
          ) : null}
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => router.push("/buscar")}
      >
        <Text style={styles.buttonText}>Nueva lectura</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  employee: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  emptyState: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  readingCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  readingDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  readingTitle: {
    fontSize: fontSizes.md,
    fontWeight: "700",
    color: colors.text,
  },
  detail: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  status: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.primaryContrast,
  },
});
