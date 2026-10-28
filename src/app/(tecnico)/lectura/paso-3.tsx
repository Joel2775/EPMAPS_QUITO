import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  calculateConsumption,
  isAnomalous,
  isPhotoRequired,
  parseReading,
} from "@/domain/consumption";
import { currentMonthYear } from "@/domain/date";
import {
  getReadingByMeterMonth,
  insertReading,
  type NewReadingRow,
} from "@/db/readings";
import { ensureCameraPermission, takePhoto } from "@/services/photos";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { buildReadingSchema } from "@/schemas/reading";
import { useDraftStore } from "@/store/draft";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";
import type { ReadingCondition } from "@/types";

export default function ReadingSummaryScreen() {
  const meter = useDraftStore((state) => state.meter);
  const meterCode = useDraftStore((state) => state.meterCode);
  const condition = useDraftStore((state) => state.condition);
  const readingText = useDraftStore((state) => state.readingText);
  const reasonOrDamage = useDraftStore((state) => state.reasonOrDamage);
  const anomalyConfirmed = useDraftStore((state) => state.anomalyConfirmed);
  const clientId = useDraftStore((state) => state.clientId);
  const photoUri = useDraftStore((state) => state.photoUri);
  const setPhotoUri = useDraftStore((state) => state.setPhotoUri);
  const setStep = useDraftStore((state) => state.setStep);
  const clearDraft = useDraftStore((state) => state.clearDraft);
  const db = useSQLiteContext();
  const { isOnlineNow } = useNetworkStatus();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "unknown" | "granted" | "denied" | "blocked"
  >("unknown");

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  useEffect(() => {
    void (async () => {
      setPermissionStatus(await ensureCameraPermission());
    })();
  }, []);

  const reading = parseReading(readingText);
  const consumption =
    reading !== null && meter
      ? calculateConsumption(reading, meter.lastReading)
      : null;
  const anomalous =
    consumption !== null && meter
      ? isAnomalous(consumption, meter.averageMonthlyConsumption)
      : false;
  const activeCondition: ReadingCondition = condition ?? "normal";
  const photoRequired = condition
    ? isPhotoRequired(condition, anomalous)
    : false;
  const missingPhoto = photoRequired && !photoUri;
  const readyToSave =
    Boolean(clientId && meterCode && condition) &&
    !missingPhoto &&
    buildReadingSchema({
      condition: activeCondition,
      lastReading: meter?.lastReading ?? null,
      average: meter?.averageMonthlyConsumption ?? null,
    }).safeParse({
      readingText,
      reasonOrDamage,
      anomalyConfirmed,
    }).success;

  async function refreshPermission() {
    const nextStatus = await ensureCameraPermission();
    setPermissionStatus(nextStatus);
  }

  async function handleTakePhoto() {
    if (!clientId) {
      return;
    }

    const nextUri = await takePhoto(clientId);

    if (nextUri) {
      setPhotoUri(nextUri);
    }

    await refreshPermission();
  }

  async function handleSave() {
    if (!readyToSave || !clientId || !meterCode || !condition || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const online = await isOnlineNow();
      const monthYear = currentMonthYear();
      const existing = await getReadingByMeterMonth(db, meterCode, monthYear);

      if (existing) {
        setSaveError(`Ya existe una lectura de ${meterCode} en ${monthYear}`);
        return;
      }

      const now = new Date().toISOString();
      const row: NewReadingRow = {
        clientId,
        meterCode,
        monthYear,
        condition,
        readingValue: reading,
        reasonOrDamage: reasonOrDamage || null,
        previousReading: meter?.lastReading ?? null,
        averageMonthly: meter?.averageMonthlyConsumption ?? null,
        consumption,
        isAnomalous: anomalous,
        anomalyConfirmed,
        photoUri,
        verification: online && meter !== null ? "verified" : "pending_verification",
        createdAt: now,
        updatedAt: now,
        sentAt: null,
      };

      try {
        await insertReading(db, row);
      } catch (caught) {
        if (
          caught instanceof Error &&
          caught.message.includes(
            "UNIQUE constraint failed: readings.meter_code, readings.month_year"
          )
        ) {
          setSaveError(
            `Ya existe una lectura de ${meterCode} en ${monthYear}`
          );
          return;
        }

        throw caught;
      }

      clearDraft();
      router.dismissTo("/");
    } catch (caught) {
      setSaveError(
        `No se pudo guardar la lectura: ${
          caught instanceof Error ? caught.message : "error desconocido"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen de lectura</Text>
      <Text style={styles.detail}>Medidor: {meter?.code ?? "Sin medidor"}</Text>
      <Text style={styles.detail}>Estado: {condition ?? "Sin seleccionar"}</Text>
      <Text style={styles.detail}>
        Lectura: {readingText || "Sin lectura"}
      </Text>
      {condition !== "normal" ? (
        <Text style={styles.detail}>
          {condition === "inaccesible" ? "Motivo" : "Descripción"}: {" "}
          {reasonOrDamage || "Sin detalle"}
        </Text>
      ) : null}
      {consumption !== null ? (
        <Text style={styles.detail}>Consumo calculado: {consumption}</Text>
      ) : null}
      {anomalous ? (
        <Text style={styles.detail}>
          Consumo anómalo; revisado: {anomalyConfirmed ? "Sí" : "No"}
        </Text>
      ) : null}

      <View style={styles.photoSection}>
        <Text style={styles.sectionLabel}>
          {photoRequired ? "Foto obligatoria" : "Foto opcional"}
        </Text>

        {permissionStatus === "denied" || permissionStatus === "blocked" ? (
          <>
            <Text style={styles.infoText}>
              La foto sirve como respaldo de la lectura ante reclamos.
            </Text>
            {permissionStatus === "denied" ? (
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => void refreshPermission()}
              >
                <Text style={styles.secondaryButtonText}>Reintentar</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => void Linking.openSettings()}
              >
                <Text style={styles.secondaryButtonText}>Abrir ajustes</Text>
              </Pressable>
            )}
          </>
        ) : null}

        {permissionStatus === "granted" ? (
          <>
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={() => void handleTakePhoto()}
            >
              <Text style={styles.primaryButtonText}>
                {photoUri ? "Cambiar foto" : "Tomar foto"}
              </Text>
            </Pressable>

            {photoUri ? (
              <>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.previewImage}
                  accessibilityLabel="Vista previa de la foto del medidor"
                />
                <Text style={styles.pathText}>{photoUri}</Text>
              </>
            ) : null}
          </>
        ) : null}

        {missingPhoto ? (
          <Text style={styles.errorText}>Falta la foto obligatoria</Text>
        ) : null}

        {readyToSave ? (
          <Text style={styles.successText}>
            Aún no está guardada. Pulsa Guardar lectura para almacenarla en
            este dispositivo.
          </Text>
        ) : null}
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !readyToSave || isSaving }}
        style={[
          styles.primaryButton,
          (!readyToSave || isSaving) && styles.disabledButton,
        ]}
        disabled={!readyToSave || isSaving}
        onPress={() => void handleSave()}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Guardando..." : "Guardar lectura"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  detail: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  photoSection: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: colors.text,
  },
  primaryButton: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.primaryContrast,
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  previewImage: {
    width: "100%",
    minHeight: 220,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  pathText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  infoText: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  errorText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.danger,
  },
  successText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.success,
  },
});
