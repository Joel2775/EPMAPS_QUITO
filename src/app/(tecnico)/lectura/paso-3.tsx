import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Key } from "@/components/ui/Key";
import { Meter } from "@/components/ui/Meter";
import { Plate } from "@/components/ui/Plate";
import { Screen } from "@/components/ui/Screen";
import { StepHeader } from "@/components/ui/StepHeader";
import {
  calculateConsumption,
  isAnomalous,
  isPhotoRequired,
  parseReading,
} from "@/domain/consumption";
import { currentMonthYear } from "@/domain/date";
import {
  getReadingByClientId,
  getReadingByMeterMonth,
  insertReading,
  type NewReadingRow,
  updateReading,
} from "@/db/readings";
import {
  deletePhoto,
  ensureCameraPermission,
  takePhoto,
} from "@/services/photos";
import { refreshPendingCount, syncPending } from "@/services/sync";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { buildReadingSchema } from "@/schemas/reading";
import { useDraftStore } from "@/store/draft";
import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import type { ReadingCondition, ReadingRow } from "@/types";

export default function ReadingSummaryScreen() {
  const meter = useDraftStore((state) => state.meter);
  const meterCode = useDraftStore((state) => state.meterCode);
  const condition = useDraftStore((state) => state.condition);
  const readingText = useDraftStore((state) => state.readingText);
  const reasonOrDamage = useDraftStore((state) => state.reasonOrDamage);
  const anomalyConfirmed = useDraftStore((state) => state.anomalyConfirmed);
  const clientId = useDraftStore((state) => state.clientId);
  const photoUri = useDraftStore((state) => state.photoUri);
  const editingClientId = useDraftStore((state) => state.editingClientId);
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
  const isEditing = Boolean(editingClientId);

  async function refreshPermission() {
    const nextStatus = await ensureCameraPermission();
    setPermissionStatus(nextStatus);
  }

  function scheduleSync() {
    void refreshPendingCount(db)
      .then(() => syncPending(db))
      .catch((error: unknown) => {
        console.error("No se pudo actualizar el envío de lecturas.", error);
      });
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
      if (isEditing && editingClientId) {
        const original = await getReadingByClientId(db, editingClientId);

        if (!original) {
          setSaveError("Esta lectura ya no se puede corregir");
          return;
        }

        const online = await isOnlineNow();
        const nextRow: ReadingRow = {
          ...original,
          condition,
          readingValue: reading,
          reasonOrDamage: reasonOrDamage || null,
          previousReading: meter?.lastReading ?? null,
          averageMonthly: meter?.averageMonthlyConsumption ?? null,
          consumption,
          isAnomalous: anomalous,
          anomalyConfirmed,
          photoUri,
          verification:
            original.verification === "pending_verification"
              ? "pending_verification"
              : online && meter !== null
                ? "verified"
                : "pending_verification",
          updatedAt: new Date().toISOString(),
          sentAt: original.sentAt,
        };

        const changed = await updateReading(db, nextRow);

        if (changed === 0) {
          setSaveError("Esta lectura ya no se puede corregir");
          return;
        }

        const previousPhoto = original.photoUri;
        if (previousPhoto && previousPhoto !== nextRow.photoUri) {
          await deletePhoto(previousPhoto);
        }

        scheduleSync();
        clearDraft();
        router.dismissTo("/");
        return;
      }

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

      scheduleSync();
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
    <Screen>
      <StepHeader currentStep={3} />
      <Text style={styles.title}>Resumen de lectura</Text>
      <Plate>
        <Text style={styles.detail}>
          Medidor: {meter?.code ?? meterCode ?? "Sin medidor"}
        </Text>
        <Text style={styles.detail}>
          Estado: {condition ?? "Sin seleccionar"}
        </Text>
        <Meter label="Lectura" value={readingText || null} />
        {condition !== "normal" ? (
          <Text style={styles.detail}>
            {condition === "inaccesible" ? "Motivo" : "Descripción"}:{" "}
            {reasonOrDamage || "Sin detalle"}
          </Text>
        ) : null}
        {consumption !== null ? (
          <Meter label="Consumo calculado" value={consumption} />
        ) : null}
        {anomalous ? (
          <Text style={styles.detail}>
            Consumo anómalo; revisado: {anomalyConfirmed ? "Sí" : "No"}
          </Text>
        ) : null}
      </Plate>

      <Plate>
        <Text style={styles.sectionLabel}>
          {photoRequired ? "Foto obligatoria" : "Foto opcional"}
        </Text>

        {permissionStatus === "denied" || permissionStatus === "blocked" ? (
          <>
            <Text style={styles.detail}>
              La foto sirve como respaldo de la lectura ante reclamos.
            </Text>
            {permissionStatus === "denied" ? (
              <Key
                label="Reintentar"
                variant="secondary"
                onPress={() => void refreshPermission()}
              />
            ) : (
              <Key
                label="Abrir ajustes"
                variant="secondary"
                onPress={() => void Linking.openSettings()}
              />
            )}
          </>
        ) : null}

        {permissionStatus === "granted" ? (
          <>
            <Key
              label={photoUri ? "Cambiar foto" : "Tomar foto"}
              onPress={() => void handleTakePhoto()}
            />
            {photoUri ? (
              <View style={styles.photoFrame}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.previewImage}
                  accessibilityLabel="Vista previa de la foto del medidor"
                />
              </View>
            ) : null}
          </>
        ) : null}

        {missingPhoto ? (
          <Plate style={styles.errorPlate}>
            <Text style={styles.errorText}>Falta la foto obligatoria</Text>
          </Plate>
        ) : null}
        {readyToSave ? (
          <Text style={styles.detail}>
            Se guardará en este dispositivo al confirmar.
          </Text>
        ) : null}
        {saveError ? (
          <Plate style={styles.errorPlate}>
            <Text style={styles.errorText}>{saveError}</Text>
          </Plate>
        ) : null}
      </Plate>

      <Key
        label={
          isSaving
            ? "Guardando..."
            : isEditing
              ? "Guardar corrección"
              : "Guardar lectura"
        }
        disabled={!readyToSave || isSaving}
        onPress={() => void handleSave()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.title,
  },
  detail: {
    fontSize: typography.body,
    lineHeight: typography.body * 1.45,
    color: colors.textPrimary,
  },
  sectionLabel: {
    fontSize: typography.subtitle,
    fontWeight: "700",
    color: colors.deepBlue,
  },
  photoFrame: {
    padding: borders.photoFrame,
    borderRadius: radius.large,
    backgroundColor: colors.gold,
  },
  previewImage: {
    width: "100%",
    minHeight: dimensions.photoMinHeight,
    borderRadius: radius.field,
  },
  errorPlate: {
    borderLeftWidth: borders.errorStripe,
    borderLeftColor: colors.error,
    backgroundColor: colors.surfaceSecondary,
  },
  errorText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.error,
  },
});
