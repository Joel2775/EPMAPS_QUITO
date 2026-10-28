import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { getReadingByClientId, listReadings } from "@/db/readings";
import { useDraftStore } from "@/store/draft";
import { useSessionStore } from "@/store/session";
import { useSyncStore } from "@/store/sync";
import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import type { ReadingRow } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Key } from "@/components/ui/Key";
import { Meter } from "@/components/ui/Meter";
import { Plate } from "@/components/ui/Plate";
import { Screen } from "@/components/ui/Screen";

export default function ExploreScreen() {
  const employeeCode = useSessionStore((state) => state.employeeCode);
  const logout = useSessionStore((state) => state.logout);
  const version = useSyncStore((state) => state.version);
  const db = useSQLiteContext();
  const startEditDraft = useDraftStore((state) => state.startEditDraft);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshReadings = useCallback(() => {
    setLoadError(null);

    return listReadings(db)
      .then((rows) => {
        setReadings(rows);
      })
      .catch((caught: unknown) => {
        setLoadError(
          `No se pudieron cargar las lecturas: ${
            caught instanceof Error ? caught.message : "error desconocido"
          }`
        );
      });
  }, [db]);

  useEffect(() => {
    void refreshReadings();
  }, [refreshReadings, version]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void refreshReadings().then(() => {
        if (!isActive) {
          return;
        }
      });

      return () => {
        isActive = false;
      };
    }, [refreshReadings])
  );

  async function handleCorrect(reading: ReadingRow) {
    try {
      const existing = await getReadingByClientId(db, reading.clientId);

      if (!existing || existing.syncStatus !== "pending") {
        Alert.alert("Esta lectura ya no se puede corregir");
        await refreshReadings();
        return;
      }

      const draftState = useDraftStore.getState();
      const hasUnfinishedDraft =
        draftState.step > 0 &&
        draftState.clientId !== null &&
        draftState.editingClientId !== reading.clientId;

      if (hasUnfinishedDraft) {
        Alert.alert(
          "Hay un registro sin terminar. ¿Reemplazarlo?",
          "Se perderá el borrador actual.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Reemplazar",
              onPress: () => {
                startEditDraft(existing);
                router.push("/lectura/paso-1");
              },
            },
          ]
        );
        return;
      }

      startEditDraft(existing);
      router.push("/lectura/paso-1");
    } catch (caught) {
      Alert.alert(
        "No se pudo abrir la corrección",
        caught instanceof Error ? caught.message : "error desconocido"
      );
      await refreshReadings();
    }
  }

  return (
    <Screen>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.eyebrow}>HISTORIAL DE CAMPO</Text>
          <Text style={styles.title}>Mis lecturas</Text>
        </View>
        <View style={styles.count}>
          <Text style={styles.countNumber}>{readings.length}</Text>
          <Text style={styles.countLabel}>registros</Text>
        </View>
      </View>
      <Text style={styles.employee}>Técnico · {employeeCode}</Text>
      {loadError ? (
        <Plate style={styles.errorPlate}>
          <Text style={styles.error}>{loadError}</Text>
        </Plate>
      ) : null}
      {!loadError && readings.length === 0 ? (
        <Plate>
          <Text style={styles.emptyTitle}>Aún no hay lecturas</Text>
          <Text style={styles.emptyDescription}>
            Cuando registres una lectura, la encontrarás aquí.
          </Text>
        </Plate>
      ) : null}

      {readings.map((reading) => {
        const showsMeasurement =
          reading.condition === "normal" ||
          (reading.condition === "dañado" && reading.readingValue !== null);
        const showsDescription =
          reading.condition === "inaccesible" || reading.condition === "dañado";
        const showsPhoto =
          (reading.condition === "normal" && reading.isAnomalous) ||
          reading.condition === "dañado";

        return (
          <Plate key={reading.clientId} style={styles.readingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.readingDetails}>
                <Text style={styles.readingTitle}>{reading.meterCode}</Text>
                <Text style={styles.month}>Periodo · {reading.monthYear}</Text>
              </View>
              <View style={styles.condition}>
                <Text style={styles.conditionLabel}>Estado</Text>
                <Text style={styles.conditionValue}>{reading.condition}</Text>
              </View>
            </View>

            {showsMeasurement ? (
              <>
                <Meter
                  label="Lectura del medidor"
                  value={reading.readingValue}
                />
                {reading.consumption !== null ? (
                  <Meter
                    label="Consumo del período"
                    value={reading.consumption}
                  />
                ) : null}
              </>
            ) : null}

            {showsDescription ? (
              <View style={styles.description}>
                <Text style={styles.descriptionLabel}>
                  {reading.condition === "inaccesible"
                    ? "Motivo de inaccesibilidad"
                    : "Descripción del daño"}
                </Text>
                <Text style={styles.descriptionText}>
                  {reading.reasonOrDamage || "Sin descripción registrada"}
                </Text>
              </View>
            ) : null}

            {showsPhoto ? (
              reading.photoUri ? (
                <View style={styles.photoSection}>
                  <Text style={styles.photoLabel}>
                    {reading.condition === "normal"
                      ? "Evidencia de consumo anómalo"
                      : "Foto del medidor dañado"}
                  </Text>
                  <View style={styles.photoFrame}>
                    <Image
                      source={{ uri: reading.photoUri }}
                      style={styles.photo}
                      resizeMode="cover"
                      accessibilityLabel={`Foto del medidor ${reading.meterCode}`}
                    />
                  </View>
                </View>
              ) : (
                <Text style={styles.photoMissing}>
                  Foto de evidencia no disponible
                </Text>
              )
            ) : null}

            <View style={styles.badges}>
              {reading.syncStatus === "sent" ? (
                <Badge label="Enviada" status="sent" />
              ) : reading.syncStatus === "sending" ? (
                <Badge label="Enviando…" status="pending" />
              ) : (
                <Badge label="Pendiente de envío" status="pending" />
              )}
              {reading.verification === "pending_verification" ? (
                <Badge label="Pendiente de verificar" status="verification" />
              ) : null}
            </View>
            {reading.syncStatus === "pending" ? (
              <Key
                label="Corregir lectura"
                variant="secondary"
                onPress={() => void handleCorrect(reading)}
              />
            ) : null}
          </Plate>
        );
      })}

      <Key label="Cerrar sesión" variant="danger" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  headingText: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.secondaryBlue,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.title,
  },
  employee: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  count: {
    minWidth: spacing.huge,
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
  },
  countNumber: {
    fontSize: typography.subtitle,
    fontWeight: "800",
    color: colors.electricBlue,
  },
  countLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyDescription: {
    fontSize: typography.body,
    lineHeight: typography.body * 1.4,
    color: colors.textSecondary,
  },
  readingCard: {
    width: "100%",
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  readingDetails: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  readingTitle: {
    fontSize: typography.subtitle,
    fontWeight: "800",
    color: colors.deepBlue,
  },
  month: {
    fontSize: typography.label,
    color: colors.textSecondary,
  },
  condition: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
  },
  conditionLabel: {
    fontSize: typography.label,
    color: colors.textSecondary,
  },
  conditionValue: {
    fontSize: typography.label,
    fontWeight: "700",
    textTransform: "capitalize",
    color: colors.textPrimary,
  },
  description: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
  },
  descriptionLabel: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  descriptionText: {
    fontSize: typography.body,
    lineHeight: typography.body * 1.4,
    color: colors.textPrimary,
  },
  photoSection: {
    gap: spacing.sm,
  },
  photoLabel: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  photoFrame: {
    padding: borders.photoFrame,
    borderRadius: radius.medium,
    backgroundColor: colors.gold,
  },
  photo: {
    width: "100%",
    height: dimensions.photoMinHeight,
    borderRadius: radius.small,
  },
  photoMissing: {
    fontSize: typography.label,
    color: colors.textMuted,
  },
  errorPlate: {
    borderLeftWidth: borders.errorStripe,
    borderLeftColor: colors.error,
    backgroundColor: colors.surfaceSecondary,
  },
  error: {
    fontSize: typography.body,
    color: colors.error,
  },
});
